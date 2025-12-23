from playwright.sync_api import sync_playwright
import json
import time

def verify_tool_use():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={'width': 1280, 'height': 800})

        try:
            print("1. Setup Config...")
            page.goto("http://localhost:5173/")

            # ADMIN USER
            admin_user = {
                'id': 'user-1',
                'email': 'admin@example.com',
                'password': 'password',
                'role': 'admin',
                'name': 'Admin User',
                'createdAt': '2023-01-01T00:00:00.000Z'
            }

            custom_models = [
                {'uuid': '1', 'name': 'Smart Bot', 'id': 'gpt-4o', 'provider': 'openai'}
            ]

            js_script = f"""
                localStorage.clear();
                const users = [{json.dumps(admin_user)}];
                localStorage.setItem('brand_ai_users', JSON.stringify(users));
                localStorage.setItem('gaod_custom_models', JSON.stringify({json.dumps(custom_models)}));

                localStorage.setItem('gaod_google_key', 'test-google-key');
                localStorage.setItem('gaod_google_image_model', 'gemini-3-pro-image-preview');
            """
            page.evaluate(js_script)

            print("2. Login...")
            page.goto("http://localhost:5173/login")
            page.fill('input[type="email"]', 'admin@example.com')
            page.fill('input[type="password"]', 'password')
            page.click('button[type="submit"]')

            # Admin gets redirected to /admin usually, wait for url change generally
            page.wait_for_url(lambda url: "/admin" in url or "/dashboard" in url)
            print(f"Logged in, current URL: {page.url}")

            print("3. Simulate LLM Tool Response (Navigate to Dashboard)...")
            page.goto("http://localhost:5173/dashboard")
            page.wait_for_url("**/dashboard")
            page.wait_for_timeout(2000) # Hydration

            page.fill('textarea', 'Draw a cat')
            page.click('button[type="submit"]')

            # Wait for response
            page.wait_for_selector('img[alt="Simulated Image - Nano Banano Pro"]', timeout=10000)
            print("SUCCESS: Image generated (simulated fallback via tool logic).")

            img_src = page.get_attribute('img[alt="Simulated Image - Nano Banano Pro"]', 'src')
            if "Simulated+Google+Image" in img_src:
                print("SUCCESS: Image source correct.")
            else:
                print(f"FAILURE: Image source unexpected: {img_src}")

            print("4. Verify Admin Config for Image Model...")
            page.goto("http://localhost:5173/admin")
            page.wait_for_selector('h1:has-text("Admin Dashboard")')

            # Check field visibility
            if page.is_visible('text=Google Image Model ID (Nano Banano Pro)'):
                print("SUCCESS: Admin field visible.")
            else:
                print("FAILURE: Admin field for image model not found.")

            page.screenshot(path="verification/tool_use_check.png")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error_tool.png")
            raise e
        finally:
            browser.close()

if __name__ == "__main__":
    verify_tool_use()
