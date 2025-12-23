from playwright.sync_api import sync_playwright
import json
import time

def verify_memory_and_tools():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={'width': 1280, 'height': 800})

        try:
            print("1. Setup Config...")
            page.goto("http://localhost:5173/")

            user = {
                'id': 'user-mem-1',
                'email': 'mem@example.com',
                'password': 'password',
                'role': 'user',
                'name': 'Memory User',
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
            """
            page.evaluate(js_script)

            print("2. Login...")
            page.goto("http://localhost:5173/login")
            page.fill('input[type="email"]', 'mem@example.com')
            page.fill('input[type="password"]', 'password')
            page.click('button[type="submit"]')
            page.wait_for_url("**/dashboard")
            page.wait_for_timeout(2000)

            print("3. Test Calculator Tool...")
            page.fill('textarea', 'Calculate 25 * 4')
            page.click('button[type="submit"]')
            # Expect result 100 in bold
            page.wait_for_selector('text=100', timeout=5000)
            print("SUCCESS: Calculator tool simulated.")

            print("4. Test Memory Update...")
            # Simulation trigger: "my name is X"
            page.fill('textarea', 'My name is Alice')
            page.click('button[type="submit"]')

            # Wait for response "Nice to meet you..."
            page.wait_for_selector('text=Nice to meet you, Alice')
            print("SUCCESS: Memory update triggered.")

            # Verify in LocalStorage
            mem = page.evaluate("""() => {
                const uid = JSON.parse(localStorage.getItem('brand_ai_session')).id;
                return localStorage.getItem('gaod_user_memory_' + uid);
            }""")
            if mem and "User's name is Alice" in mem:
                print(f"SUCCESS: Memory stored in localStorage: {mem}")
            else:
                print(f"FAILURE: Memory not found in localStorage. Got: {mem}")

            print("5. Verify Memory in Settings UI...")
            page.click('text=Settings') # This opens the modal

            # Check for tabs
            page.click('text=AI Memory')

            if page.is_visible('text=User\'s name is Alice'):
                print("SUCCESS: Memory visible in Settings UI.")
            else:
                print("FAILURE: Memory text not found in UI.")

            # Verify Clear Memory
            page.on('dialog', lambda dialog: dialog.accept())
            page.click('button:has-text("Clear Memory")')

            # Check if cleared
            page.wait_for_selector('text=Memory is empty')
            print("SUCCESS: Memory cleared.")

            page.screenshot(path="verification/memory_check.png")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error_memory.png")
            raise e
        finally:
            browser.close()

if __name__ == "__main__":
    verify_memory_and_tools()
