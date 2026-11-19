import time
import os
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

SCREENSHOT_DIR = "D:/DataFix/docs/screenshots/walkthrough"
os.makedirs(SCREENSHOT_DIR, exist_ok=True)

opts = Options()
opts.add_argument('--headless=new')
opts.add_argument('--no-sandbox')
opts.add_argument('--disable-dev-shm-usage')
opts.add_argument('--window-size=1440,900')

driver = webdriver.Chrome(options=opts)
wait = WebDriverWait(driver, 10)

try:
    # 1. Reset to light mode
    driver.get("http://127.0.0.1:5173/#/walkthrough")
    time.sleep(1)
    driver.execute_script("localStorage.setItem('datafix_theme', 'light');")
    driver.get("http://127.0.0.1:5173/#/walkthrough")
    time.sleep(1)

    # Capture 00: Hero section
    driver.save_screenshot(f"{SCREENSHOT_DIR}/00_hero_section.png")
    print("Saved 00_hero_section.png")

    # Scroll smoothly into cinematic section
    cinematic = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='walkthrough-cinematic-section']")))
    driver.execute_script("arguments[0].scrollIntoView({behavior: 'instant', block: 'start'});", cinematic)
    time.sleep(0.5)

    # Capture each stage 1 through 8
    for i in range(1, 9):
        tab = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, f"[data-testid='stage-tab-{i}']")))
        tab.click()
        time.sleep(0.8)
        # Ensure the showcase viewport is centered in view
        viewport = driver.find_element(By.CSS_SELECTOR, ".v3-showcase-viewport")
        driver.execute_script("arguments[0].scrollIntoView({behavior: 'instant', block: 'start'});", viewport)
        time.sleep(0.3)
        driver.save_screenshot(f"{SCREENSHOT_DIR}/0{i}_stage_{i}.png")
        print(f"Saved 0{i}_stage_{i}.png")

    # Dark mode screenshot on stage 8
    theme_btn = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "[data-testid='walkthrough-theme-toggle']")))
    theme_btn.click()
    time.sleep(0.6)
    driver.save_screenshot(f"{SCREENSHOT_DIR}/09_stage_dark_mode.png")
    print("Saved 09_stage_dark_mode.png")

    # Reset theme back to light
    theme_btn.click()
    time.sleep(0.3)

finally:
    driver.quit()

print("All screenshots successfully captured!")
