import re
css_path = 'agri-connect/frontend/css/style.css'
with open(css_path, 'r', encoding='utf-8') as f:
    css = f.read()
css = css.replace("url('assets/farmer-field.jpg')", "url('../assets/farmer-field.jpg')")
with open(css_path, 'w', encoding='utf-8') as f:
    f.write(css)
