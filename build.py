import os
import re
import shutil

base_dir = "."
assets_dir = os.path.join(base_dir, "assets")
os.makedirs(assets_dir, exist_ok=True)

logo_src = os.path.join(base_dir, "Shiv Sakti UI & Logo/Final Draft  (1).png")
logo_dest = os.path.join(assets_dir, "logo.png")
if os.path.exists(logo_src):
    shutil.copy(logo_src, logo_dest)

files_to_process = {
    "Shiv Sakti UI & Logo/shiv_shakti_project_homepage_animated_white_edition/code.html": "index.html",
    "Shiv Sakti UI & Logo/shop_men_animated_white_edition/code.html": "shop.html",
    "Shiv Sakti UI & Logo/pulsar_jacket_animated_white_edition/code.html": "product.html",
    "Shiv Sakti UI & Logo/lookbook_ss26_animated_white_edition/code.html": "lookbook.html",
    "Shiv Sakti UI & Logo/shopping_bag_animated_white_edition/code.html": "cart.html",
}

def update_links(html):
    
    html = re.sub(r'<a[^>]*>DEMOWOMAN</a>', r'<a href="shop.html" class="font-nav-ui text-nav-ui uppercase text-gray-500 hover:text-black transition-colors duration-300 flex items-center h-full border-b border-transparent">DEMOWOMAN</a>', html)
    html = re.sub(r'<a[^>]*>DEMOMAN</a>', r'<a href="shop.html" class="font-nav-ui text-nav-ui uppercase text-gray-500 hover:text-black transition-colors duration-300 flex items-center h-full border-b border-transparent">DEMOMAN</a>', html)
    html = re.sub(r'<a[^>]*>BAZACOLLECTIONS</a>', r'<a href="index.html" class="font-nav-ui text-nav-ui uppercase text-gray-500 hover:text-black transition-colors duration-300 flex items-center h-full border-b border-transparent">BAZACOLLECTIONS</a>', html)
    html = re.sub(r'<a[^>]*>BAZANEWS</a>', r'<a href="index.html" class="font-nav-ui text-nav-ui uppercase text-gray-500 hover:text-black transition-colors duration-300 flex items-center h-full border-b border-transparent">BAZANEWS</a>', html)
    html = re.sub(r'<a[^>]*>LOOKBOOK</a>', r'<a href="lookbook.html" class="font-nav-ui text-nav-ui uppercase text-gray-500 hover:text-black transition-colors duration-300 flex items-center h-full border-b border-transparent">LOOKBOOK</a>', html)

    
    logo_html = r'<a href="index.html" class="flex items-center justify-center"><img src="assets/logo.png" alt="SHIV SHAKTI PROJECT" class="h-[40px] object-contain mix-blend-multiply" /></a>'
    html = re.sub(r'<div[^>]*>\s*SHIV SHAKTI PROJECT\s*</div>', logo_html, html)
    html = re.sub(r'<span[^>]*>SHIV SHAKTI PROJECT</span>', logo_html, html)
    
    
    html = html.replace('href="#"', 'href="shop.html"')
    
    
    html = html.replace('<button class="text-gray-500 hover:text-black transition-colors duration-300 flex items-center justify-center">\n<span class="material-symbols-outlined" data-icon="shopping_bag">shopping_bag</span>\n</button>', 
                        '<a href="cart.html" class="text-gray-500 hover:text-black transition-colors duration-300 flex items-center justify-center"><span class="material-symbols-outlined" data-icon="shopping_bag">shopping_bag</span></a>')
    
    def add_article_onclick(match):
        attributes = match.group(1)
        if re.search(r'\sonclick\s*=', attributes, flags=re.IGNORECASE):
            return match.group(0)
        return f'<article{attributes} onclick="window.location.href=\'product.html\'">'

    html = re.sub(r'<article\b([^>]*)>', add_article_onclick, html)
    
    return html

for src, dest in files_to_process.items():
    src_path = os.path.join(base_dir, src)
    if os.path.exists(src_path):
        with open(src_path, "r", encoding="utf-8") as f:
            content = f.read()
        
        updated_content = update_links(content)
        
        with open(os.path.join(base_dir, dest), "w", encoding="utf-8") as f:
            f.write(updated_content)
        print(f"Processed {dest}")
    else:
        print(f"File not found: {src_path}")
