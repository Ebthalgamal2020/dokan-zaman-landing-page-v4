"""
Build index.html from tools/index.template.html.

The category, service and box markup repeats in several places (story box, gallery,
quick links, quote form), so it is written once here and injected at the
<!-- name --> markers of the template. Run from the project root:

    python tools/build-page.py

The header logo is the inline animated SVG generated for V1 by its tools/build-logo.py
(copied into V4 as assets/images/logo/dokan-zaman-logo-animated.svg): every path is the
untouched official artwork, only wrapped in <g class="lg ..."> groups for the animation.
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TEMPLATE = ROOT / "tools" / "index.template.html"
PAGE = ROOT / "index.html"
LOGO = ROOT / "assets" / "images" / "logo" / "dokan-zaman-logo-animated.svg"
IMG = "assets/images/categories/"

# Category name with the emphasised (orange) part marked by [ ].
CATEGORIES = [
    ("01", "cleaning", "01-cleaning", "مستهلكات وأدوات [النظافة]",
     "منظفات، أدوات تنظيف، أكياس قمامة، قفازات، مستلزمات الحمامات والمطابخ.",
     "عبوتا منظف بخاخ ودلو أبيض بقفاز برتقالي ومناشف رمادية وفرشاة خشبية", 832),
    ("02", "office", "02-office", "الأدوات [المكتبية]",
     "أقلام، دفاتر، ملفات، أوراق، أدوات تنظيم ومستلزمات المكاتب.",
     "رزم ورق أبيض وملف أزرق وملفات ورقية وحامل أقلام ودبّاسة", 832),
    ("03", "operations", "03-operations", "مستلزمات [التشغيل]",
     "مستلزمات صيانة وتشغيل، أدوات عمل، مهمات سلامة ومستلزمات فنية.",
     "بكرة كابل وقفاز عمل وشريط لاصق وعبوة رذاذ وأربطة تثبيت", 832),
    ("04", "packaging", "04-packaging", "العبوات [والتغليف]",
     "عبوات ورقية وبلاستيكية، أكياس، كراتين، حلول تغليف حسب الطلب.",
     "كراتين وأكياس ورقية وعلبة بلاستيكية شفافة وبكرتا شريط لاصق", 832),
    ("05", "paper", "05-paper", "[الورقيات]",
     "أوراق طباعة وتصوير، رول ورق، مناديل ومستلزمات ورقية متنوعة.",
     "رزم ورق أبيض ولفائف ورقية وعلب مناديل", 832),
    ("06", "hospitality", "06-hospitality", "مستلزمات [الضيافة] والبوفيه",
     "أكواب وأطباق، أدوات تقديم، مناديل، مواد ومستلزمات الضيافة.",
     "دورق معدني وفناجين وأطباق بيضاء وأكواب ورقية ومناديل على صينية", 832),
    ("07", "safety", "07-safety", "معدات [الصحة والسلامة]", None,
     "خوذة بيضاء وسترة عاكسة ونظارة واقية وقفازات عمل وواقي أذن وكمامة", 912),
    ("08", "tools", "08-tools", "الأدوات [والماكينات الخفيفة]", None,
     "مثقاب كهربائي ومطرقة ومفكات وشريط قياس وقاطعة وكماشة ومفتاح وحقيبة عدة", 912),
    ("09", "medical", "09-medical", "المستلزمات [الطبية]", None,
     "قفازات طبية وكمامات وضمادات ولاصقات طبية وعبوة معقم ومناديل", 912),
]

SERVICES = [
    ("monthly", "توريد [شهري]", "توريد مستلزمات التشغيل وفق جدول شهري."),
    ("periodic", "توريد [دوري]", "طلبات أسبوعية أو دورية حسب احتياج العميل."),
    ("po", "أوامر [شراء]", "التعامل مع أوامر الشراء وقوائم الأصناف المعتمدة."),
    ("on-demand", "توريدات [حسب الطلب]", "توفير أصناف محددة وفق المواصفات المطلوبة."),
    ("custom-list", "قوائم أصناف [مخصصة]", "إعداد قوائم توريد خاصة بكل عميل أو موقع."),
]

AR = str.maketrans("0123456789", "٠١٢٣٤٥٦٧٨٩")


def ar(n):
    return str(n).translate(AR)


def emph(text):
    return text.replace("[", '<span class="text-orange">').replace("]", "</span>")


def plain(text):
    return text.replace("[", "").replace("]", "")


# --------------------------------------------------------------- the box
def face(cls, out_inner=""):
    return f'<div class="bx bx--{cls}"><span class="bx__out">{out_inner}</span><span class="bx__in"></span></div>'


def flap(side, out_inner=""):
    long = " bx-flap--long" if side in ("front", "back") else ""
    return (f'<div class="bx-hinge bx-hinge--{side}"><div class="bx-flap{long}" data-flap="{side}">'
            f'<span class="bx__out">{out_inner}</span><span class="bx__in"></span></div></div>')


LABEL = ('<span class="bx-label"><img src="assets/images/logo/dokan-zaman-logo.svg" alt="" width="900" height="346">'
         '<span class="bx-label__rule"></span>'
         '<span class="bx-label__line">دكان زمان للتوريدات العمومية</span>'
         '<span class="bx-label__line bx-label__line--sub">من طلبكم .. إلى باب مقركم</span></span>')


def box(label=True, items=False):
    parts = [
        '<div class="box3d__shadow" data-box-shadow></div>',
        '<div class="box3d__body" data-box-body>',
        face("bottom"),
        face("back"),
        face("left", '<span class="bx-tape-v"></span>'),
        face("right", '<span class="bx-tape-v"></span>'),
        face("front", LABEL if label else ""),
        flap("left"),
        flap("right"),
        flap("back", '<span class="bx-tape-h"></span>'),
        flap("front", '<span class="bx-tape-h"></span><span class="bx-cut" data-cut></span>'),
    ]
    if items:
        parts.append('<div class="bx-items">')
        for i, (num, key, file, name, _items, _alt, h) in enumerate(CATEGORIES):
            ih = 438 if h == 832 else 480
            parts.append(
                f'<figure class="bx-item bx-item--{i % 3}{" bx-item--tall" if h == 912 else ""}" data-item="{i}">'
                f'<img src="{IMG}{file}-320.webp" srcset="{IMG}{file}-320.webp 320w, {IMG}{file}-640.webp 640w" '
                f'sizes="(min-width: 1024px) 240px, 110px" alt="" width="640" height="{ih}" decoding="async" fetchpriority="low">'
                f'<figcaption><span>{ar(num)}</span> {plain(name)}</figcaption></figure>')
        parts.append('</div>')
    parts.append('</div>')
    return "\n".join(parts)


# --------------------------------------------------------------- gallery
def stage_figures():
    out = []
    for i, (num, key, file, name, _items, alt, h) in enumerate(CATEGORIES):
        active = " is-active" if i == 0 else ""
        loading = 'loading="lazy"'
        tall = " panel3d__fig--tall" if h == 912 else ""
        out.append(
            f'<figure class="panel3d__fig{tall}{active}" data-for="{num}">'
            f'<img src="{IMG}{file}.webp" srcset="{IMG}{file}-640.webp 640w, {IMG}{file}.webp 1216w" '
            f'sizes="(min-width: 1024px) 52vw, 1px" alt="{alt}" width="1216" height="{h}" {loading} decoding="async">'
            f'<figcaption class="sr-only">{ar(num)} {plain(name)}</figcaption></figure>')
    return "\n".join(out)


def gallery_items():
    out = []
    for i, (num, key, file, name, items, alt, h) in enumerate(CATEGORIES):
        ih = 438 if h == 832 else 480
        tall = " cat__media--tall" if h == 912 else ""
        desc = (f'<p class="cat__items">{items}</p>' if items
                else '<p class="cat__items cat__items--hint">حدّدوا الأصناف والمواصفات المطلوبة في طلب عرض السعر.</p>')
        out.append(f'''<li class="cat{" is-active" if i == 0 else ""}" id="cat-{num}" data-cat="{num}">
  <figure class="cat__media{tall}"><img src="{IMG}{file}-640.webp" srcset="{IMG}{file}-640.webp 640w, {IMG}{file}.webp 1216w" sizes="(min-width: 1024px) 1px, 84vw" alt="{alt}" width="640" height="{ih}" loading="lazy" decoding="async"></figure>
  <div class="cat__body">
    <h3 class="cat__title"><button type="button" class="cat__select" data-cat-select="{num}" aria-controls="cat-stage"><span class="num">{ar(num)}</span> <span class="cat__name">{emph(name)}</span></button></h3>
    {desc}
    <a class="cat__cta" href="#quote-categories" data-quote-category="{key}">اطلب <span class="text-orange">عرض سعر</span> لهذا المجال</a>
  </div>
</li>''')
    return "\n".join(out)


def gallery_dots():
    return "\n".join(
        f'<a class="cats-dots__dot{" is-active" if i == 0 else ""}" href="#cat-{num}" data-dot="{num}" aria-label="{plain(name)}">{ar(num)}</a>'
        for i, (num, _k, _f, name, *_rest) in enumerate(CATEGORIES))


# --------------------------------------------------------------- services
SERVICE_ICON = '''<svg viewBox="0 0 64 60" aria-hidden="true" focusable="false">
  <g class="svc-box__body"><path d="M8 22 32 34v22L8 44Z"/><path d="M56 22 32 34v22l24-12Z"/></g>
  <g class="svc-box__lid"><path d="M8 22 32 10l24 12-24 12Z"/><path class="svc-box__tape" d="M20 16l24 12"/></g>
  <path class="svc-box__tape" d="M44 28v10"/>
</svg>'''


def service_items():
    out = []
    for i, (key, title, desc) in enumerate(SERVICES, 1):
        out.append(f'''<li class="service">
  <div class="service__icon"><span class="service__num">{ar(i)}</span>{SERVICE_ICON}</div>
  <h3 class="service__title">{plain(title)}</h3>
  <p class="service__desc">{desc}</p>
  <a class="text-link" href="#quote-services" data-quote-service="{key}">اختيار هذه الخدمة</a>
</li>''')
    return "\n".join(out)


# --------------------------------------------------------------- form
def form_categories():
    return "\n".join(
        f'<label class="choice"><input type="checkbox" name="categories" value="{key}"><span>{plain(name)}</span></label>'
        for _n, key, _f, name, *_rest in CATEGORIES)


def form_services():
    rows = [(k, plain(t)) for k, t, _d in SERVICES] + [("procurement", "إدارة المشتريات نيابة عن الشركة")]
    return "\n".join(
        f'<label class="choice"><input type="radio" name="service" value="{k}"><span>{t}</span></label>' for k, t in rows)


# --------------------------------------------------------------- logo
def logo():
    svg = LOGO.read_text(encoding="utf-8").strip()
    head = ' class="logo-svg" role="img" aria-labelledby="dz-logo-title">\n<title id="dz-logo-title">دكان زمان</title>'
    assert svg.count(head) == 1, "unexpected logo markup"
    # The link carries the accessible name, so the SVG itself is decorative here.
    return "<!-- logo:start -->" + svg.replace(head, ' class="logo-svg" aria-hidden="true" focusable="false">\n') + "<!-- logo:end -->"


def main():
    html = TEMPLATE.read_text(encoding="utf-8")
    blocks = {
        "logo:inline": logo(),
        "box:story": box(label=True, items=True),
        "box:seal": box(label=True),
        "box:mini": box(label=False),
        "stage:figures": stage_figures(),
        "gallery:items": gallery_items(),
        "gallery:dots": gallery_dots(),
        "services:items": service_items(),
        "form:categories": form_categories(),
        "form:services": form_services(),
    }
    for name, markup in blocks.items():
        marker = f"<!-- {name} -->"
        assert html.count(marker) == 1, marker
        html = html.replace(marker, markup)
    PAGE.write_text(html, encoding="utf-8", newline="\n")
    print("wrote", PAGE.relative_to(ROOT), len(html), "chars")


if __name__ == "__main__":
    main()
