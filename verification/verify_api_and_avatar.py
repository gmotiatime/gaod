from playwright.sync_api import sync_playwright
import json

def verify_api_and_avatar():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Use a larger viewport to ensure sidebar/layout is standard
        page = browser.new_page(viewport={'width': 1280, 'height': 800})

        try:
            # 1. Setup Data
            print("Injecting user and models...")
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

            # Custom Model
            custom_model = {
                'uuid': 'custom-1',
                'name': 'My Custom GPT',
                'id': 'gpt-3.5-turbo',
                'provider': 'openai'
            }

            js_script = f"""
                // User
                const users = JSON.parse(localStorage.getItem('brand_ai_users') || '[]');
                const cleanUsers = users.filter(u => u.email !== 'user@example.com');
                cleanUsers.push({json.dumps(regular_user)});
                localStorage.setItem('brand_ai_users', JSON.stringify(cleanUsers));

                // Models - ONLY Custom one
                const models = [{json.dumps(custom_model)}];
                localStorage.setItem('gaod_custom_models', JSON.stringify(models));

                // Set invalid API key
                localStorage.setItem('gaod_openai_key', 'invalid-sk-key');
            """
            page.evaluate(js_script)

            # 2. Login
            print("Logging in...")
            page.goto("http://localhost:5173/login")
            page.fill('input[type="email"]', 'user@example.com')
            page.fill('input[type="password"]', 'password')
            page.click('button[type="submit"]')
            page.wait_for_url("**/dashboard")

            # 3. Check Models Dropdown
            print("Checking Model Selector...")
            # Wait for the button to appear. It contains the text of the selected model.
            page.wait_for_selector('button:has-text("My Custom GPT")')

            # Click to open dropdown
            # We target the button explicitly to open it
            print("Opening dropdown...")
            page.click('button:has-text("My Custom GPT")')

            # Verify Default Models are GONE
            # We check if the dropdown list is visible
            page.wait_for_selector('div.absolute.top-full') # The dropdown container

            if page.is_visible('text=Claude 3.5 Sonnet'):
                print("FAILURE: Default model 'Claude 3.5 Sonnet' found!")
            else:
                print("SUCCESS: Default models removed.")

            # Close dropdown by selecting the item again (or clicking backdrop)
            # The list item is in the absolute div. We click that specific one to ensure we don't hit the covered button.
            print("Selecting model to close dropdown...")
            # The list item button contains the text "My Custom GPT" and is inside the dropdown container
            page.click('div.absolute.top-full button:has-text("My Custom GPT")')

            # 4. Check API Call & Avatar
            print("Sending message...")
            page.fill('textarea', 'Test Message')
            page.click('button[type="submit"]')

            # Wait for response
            # Expect 401 Error
            print("Waiting for error response...")
            page.wait_for_selector('text=OpenAI Error: 401', timeout=15000)
            print("SUCCESS: API attempted and failed with 401 (as expected).")

            # 5. Check Avatar
            print("Checking Avatar...")
            # Verify the MoleculeIcon is present in the chat (user and ai have avatars)
            # AI avatar container has bg-[#1A1A1A]
            ai_avatar_selector = '.bg-\[\#1A1A1A\].rounded-full'
            # (Escaping brackets might be tricky in selector string, lets use partial class)
            # Or just take screenshot
            page.screenshot(path="verification/avatar_check.png")
            print("Screenshot taken.")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error_api.png")
            raise e # Re-raise to fail the tool call if needed

        finally:
            browser.close()

if __name__ == "__main__":
    verify_api_and_avatar()
