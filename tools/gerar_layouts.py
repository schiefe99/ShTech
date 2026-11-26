"""
GERAR LAYOUTS — transforma os templates do prospect (Jinja) nos HTML
prontos que o site da SHTECH usa em client/public/layouts/.

Rodar na raiz do projeto ShTech (precisa do Jinja2: pip install jinja2):

    python tools/gerar_layouts.py
    python tools/gerar_layouts.py "C:/outro/caminho/prospectalp"

Como funciona: o próprio demo_builder.py do prospect monta a página,
mas no lugar do nome, da cidade e do WhatsApp do lead vão MARCADORES
(§NOME§, §CIDADE§, §WA§). O React troca esses marcadores pelo que o
visitante digita (client/src/utils/renderLanding.js).

Para adicionar um layout: coloque mais uma linha em LAYOUTS abaixo
(key do site, nicho do prospect) e um objeto em
client/src/data/layoutPresets.js com a mesma key.
"""
import shutil
import sys
import types
from pathlib import Path

LAYOUTS = [
    ("essencial", "nutricionista"),  # base_lp.html.j2
    ("foto", "academia"),            # academia_lp.html.j2
    ("animado", "barbearia"),        # barbearia_mallu_lp.html.j2
]

RAIZ = Path(__file__).resolve().parent.parent
PROSPECT = Path(sys.argv[1] if len(sys.argv) > 1 else Path.home() / "Downloads" / "prospectalp")
APP = PROSPECT / "backend" / "app"
SAIDA = RAIZ / "client" / "public" / "layouts"

# O demo_builder importa config, validators e slugify do prospect.
# Aqui não precisamos deles, então entram "dublês" (stubs) no lugar.
sys.path.insert(0, str(APP.parent))
cfg = types.ModuleType("app.config")
cfg.settings = types.SimpleNamespace(public_base_url="")
val = types.ModuleType("app.services.validators")
val.telefone_valido = lambda _: False
slug = types.ModuleType("slugify")
slug.slugify = lambda s: s
sys.modules.update({"app.config": cfg, "app.services.validators": val, "slugify": slug})

from app.services import demo_builder  # noqa: E402  (precisa vir depois dos stubs)

SAIDA.mkdir(parents=True, exist_ok=True)
for key, nicho in LAYOUTS:
    lead = types.SimpleNamespace(
        niche=nicho, campaign=None, city="§CIDADE§", state="", business_name="§NOME§",
        instagram="", whatsapp="", wa_deeplink="", phone="",
    )
    ctx = demo_builder.build_demo_data(lead)
    ctx["whatsapp_link"] = "§WA§"
    ctx["asset_base"] = "/layouts/static"  # imagens servidas pelo Vite (public/)
    html = demo_builder.render_demo(ctx)
    # o filtro tojson do Jinja escreve "§" como \u00a7 dentro do <script>
    html = html.replace("\\u00a7", "§")
    (SAIDA / f"{key}.html").write_text(html, encoding="utf-8")
    print(f"✓ {key}.html  ({ctx['template']})")

# imagens usadas pelos templates (ex.: fotos da academia)
static = APP / "niche_templates" / "static"
(SAIDA / "static").mkdir(exist_ok=True)
for img in static.glob("*.webp"):
    shutil.copy2(img, SAIDA / "static" / img.name)
print(f"✓ imagens copiadas para {SAIDA / 'static'}")
