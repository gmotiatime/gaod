from playwright.sync_api import sync_playwright
import json
import time

def verify_real_features():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={'width': 1280, 'height': 800})

        try:
            print("1. Setup Config...")
            page.goto("http://localhost:5173/")

            user = {
                'id': 'user-real-1',
                'email': 'real@example.com',
                'password': 'password',
                'role': 'user',
                'name': 'Real User',
                'createdAt': '2023-01-01T00:00:00.000Z'
            }

            custom_models = [
                {'uuid': '1', 'name': 'Smart Bot', 'id': 'gpt-4o', 'provider': 'openai'}
            ]

            js_script = f"""
                localStorage.clear();
                const users = [{json.dumps(user)}];
                localStorage.setItem('brand_ai_users', JSON.stringify(users));
                localStorage.setItem('gaod_custom_models', JSON.stringify({json.dumps(custom_models)}));

                // Set Keys
                localStorage.setItem('gaod_openai_key', 'test-openai-key');
                localStorage.setItem('gaod_search_key', 'test-search-key');
                localStorage.setItem('gaod_search_cx', 'test-cx');
            """
            page.evaluate(js_script)

            print("2. Login...")
            page.goto("http://localhost:5173/login")
            page.fill('input[type="email"]', 'real@example.com')
            page.fill('input[type="password"]', 'password')
            page.click('button[type="submit"]')
            page.wait_for_url("**/dashboard")
            page.wait_for_timeout(1000)

            print("3. Test Search Tool Execution...")

            def handle_openai(route):
                route.fulfill(
                    status=200,
                    content_type="application/json",
                    body=json.dumps({
                        "choices": [{
                            "message": {
                                "content": "I will search.\n[WEB_SEARCH: OpenAI]"
                            }
                        }]
                    })
                )

            search_called = False
            def handle_google(route):
                nonlocal search_called
                search_called = True
                route.fulfill(
                    status=200,
                    content_type="application/json",
                    body=json.dumps({
                        "items": [
                            {"title": "Real API Mock Result", "link": "http://example.com", "snippet": "This proves the fetch ran."}
                        ]
                    })
                )

            page.route("https://api.openai.com/v1/chat/completions", handle_openai)
            page.route("https://www.googleapis.com/customsearch/v1*", handle_google)

            page.fill('textarea', 'Search for OpenAI')
            page.click('button[type="submit"]')

            page.wait_for_selector('text=Real API Mock Result', timeout=10000)

            if search_called:
                print("SUCCESS: Google Search API called.")
            else:
                print("FAILURE: Google Search API NOT called.")

            print("4. Verify Admin Fields...")
            admin_user = user.copy()
            admin_user['role'] = 'admin'
            admin_user['email'] = 'admin@example.com'

            js_admin = f"""
                const users = [{json.dumps(admin_user)}];
                localStorage.setItem('brand_ai_users', JSON.stringify(users));
            """
            page.evaluate(js_admin)

            page.goto("http://localhost:5173/login")
            page.fill('input[type="email"]', 'admin@example.com')
            page.fill('input[type="password"]', 'password')
            page.click('button[type="submit"]')

            page.wait_for_url(lambda url: "/admin" in url or "/dashboard" in url)
            if "/admin" not in page.url:
                page.goto("http://localhost:5173/admin")

            page.wait_for_selector('h1:has-text("Admin Dashboard")')

            if page.is_visible('text=Search API Key'):
                print("SUCCESS: Admin fields visible.")
            else:
                print("FAILURE: Admin fields missing.")

            page.screenshot(path="verification/real_features_final.png")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error_real_final.png")
            raise e
        finally:
            browser.close()

if __name__ == "__main__":
    verify_real_features()
