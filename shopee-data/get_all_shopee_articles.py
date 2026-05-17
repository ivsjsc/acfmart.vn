import requests
import json
import time

def fetch_shopee_help_data():
    base_url = "https://help.shopee.vn/api/v4/helpcenter"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/json",
        "Referer": "https://help.shopee.vn/portal/4"
    }
    
    # 1. Get all categories
    cat_url = f"{base_url}/get_categories?region=VN"
    response = requests.get(cat_url, headers=headers)
    if response.status_code != 200:
        print("Failed to get categories")
        return
    
    categories = response.json().get('data', {}).get('categories', [])
    all_articles = []
    
    for cat in categories:
        cat_id = cat.get('category_id')
        cat_name = cat.get('category_name')
        print(f"Processing Category: {cat_name} ({cat_id})")
        
        # 2. Get subcategories
        sub_cat_url = f"{base_url}/get_sub_categories?category_id={cat_id}&region=VN"
        sub_response = requests.get(sub_cat_url, headers=headers)
        sub_categories = sub_response.json().get('data', {}).get('sub_categories', [])
        
        for sub_cat in sub_categories:
            sub_cat_id = sub_cat.get('sub_category_id')
            sub_cat_name = sub_cat.get('sub_category_name')
            
            # 3. Get articles for each subcategory
            page = 1
            while True:
                articles_url = f"{base_url}/get_articles_by_sub_category?sub_category_id={sub_cat_id}&page={page}&page_size=20&region=VN"
                art_response = requests.get(articles_url, headers=headers)
                art_data = art_response.json().get('data', {})
                articles_list = art_data.get('articles', [])
                
                if not articles_list:
                    break
                
                for art in articles_list:
                    all_articles.append({
                        "main_category": cat_name,
                        "sub_category": sub_cat_name,
                        "article_id": art.get('article_id'),
                        "title": art.get('title'),
                        "url": f"https://help.shopee.vn/portal/4/article/{art.get('article_id')}"
                    })
                
                if len(articles_list) < 20:
                    break
                page += 1
                time.sleep(0.5) # Be polite
                
    with open('/home/ubuntu/shopee_articles_list.json', 'w', encoding='utf-8') as f:
        json.dump(all_articles, f, ensure_ascii=False, indent=4)
    print(f"Total articles found: {len(all_articles)}")

if __name__ == "__main__":
    fetch_shopee_help_data()
