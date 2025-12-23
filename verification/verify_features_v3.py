from playwright.sync_api import sync_playwright
import json
import time

def verify_features_v3():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={'width': 1280, 'height': 800})

        # Capture console logs
        page.on("console", lambda msg: print(f"BROWSER CONSOLE: {msg.text}"))
        page.on("pageerror", lambda err: print(f"BROWSER ERROR: {err}"))

        try:
            print("1. Setup Config & Data...")
            page.goto("http://localhost:5173/")

            # User
            regular_user = {
                'id': 'user-1',
                'email': 'user@example.com',
                'password': 'password',
                'role': 'user',
                'name': 'Regular User',
                'createdAt': '2023-01-01T00:00:00.000Z'
            }

            # Models
            custom_models = [
                {'uuid': '1', 'name': 'Text Bot', 'id': 'gpt-3.5-turbo', 'provider': 'openai', 'type': 'text'},
                {'uuid': '2', 'name': 'Image Gen', 'id': 'dall-e-3', 'provider': 'openai', 'type': 'image'}
            ]

            # Chat
            chat_data = [{
                'id': 'chat-1',
                'title': 'Test Chat',
                'messages': [
                    {'id': 'm1', 'role': 'user', 'content': 'Show me markdown'},
                    {'id': 'm2', 'role': 'assistant', 'content': '# Hello World\n\n**Bold Text**\n\n- List Item'}
                ],
                'createdAt': '2023-01-01T00:00:00.000Z',
                'updatedAt': '2023-01-01T00:00:00.000Z'
            }]

            js_script = f"""
                localStorage.clear();
                const users = [{json.dumps(regular_user)}];
                localStorage.setItem('brand_ai_users', JSON.stringify(users));
                localStorage.setItem('gaod_custom_models', JSON.stringify({json.dumps(custom_models)}));
                localStorage.setItem('brand_ai_chats', JSON.stringify({json.dumps(chat_data)}));
            """
            page.evaluate(js_script)

            print("2. Login...")
            page.goto("http://localhost:5173/login")
            page.fill('input[type="email"]', 'user@example.com')
            page.fill('input[type="password"]', 'password')
            page.click('button[type="submit"]')

            # Wait for navigation and load
            try:
                page.wait_for_url("**/dashboard", timeout=5000)
            except:
                print("Navigation to dashboard timeout/failed.")

            page.wait_for_timeout(2000)

            print("Current URL:", page.url)
            page.screenshot(path="verification/debug_v3.png")

            # Check for specific failure markers
            if page.locator("text=Loading").is_visible():
                print("Stuck on Loading...")

            # Try to find header
            if page.is_visible('h1:has-text("Hello World")'):
                print("SUCCESS: Markdown H1 found.")
            else:
                print("FAILURE: Markdown H1 NOT found.")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error_v3.png")
            raise e
        finally:
            browser.close()

if __name__ == "__main__":
    verify_features_v3()
