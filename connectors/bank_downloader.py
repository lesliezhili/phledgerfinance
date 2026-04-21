# WARNING: Automating bank logins may violate terms of service.
# Use at your own risk. This is experimental and may not work if banks change their UI.
# Requires valid credentials passed as environment variables or constructor args.

import os
import time
import logging
from pathlib import Path
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager

logger = logging.getLogger(__name__)

class BankDownloader:
    """
    Automated bank CSV downloader for ANZ and RBC.
    
    WARNING: Screen scraping may violate bank terms of service.
    Use bank APIs when available instead.
    """
    
    def __init__(self, bank: str, username: str = None, password: str = None):
        """
        Initialize downloader.
        
        Args:
            bank: "anz" or "rbc"
            username: Bank username (or set ANZ_USERNAME / RBC_USERNAME env var)
            password: Bank password (or set ANZ_PASSWORD / RBC_PASSWORD env var)
        """
        self.bank = bank.lower()
        
        if self.bank == "anz":
            self.username = username or os.getenv("ANZ_USERNAME")
            self.password = password or os.getenv("ANZ_PASSWORD")
        elif self.bank == "rbc":
            self.username = username or os.getenv("RBC_USERNAME")
            self.password = password or os.getenv("RBC_PASSWORD")
        else:
            raise ValueError(f"Unsupported bank: {bank}")
        
        if not self.username or not self.password:
            raise ValueError(f"Credentials missing for {bank}")

    def download_csv(self, start_date: datetime, end_date: datetime, download_dir: Path):
        """
        Download CSV statements from bank for date range.
        
        Args:
            start_date: datetime object for start date
            end_date: datetime object for end date
            download_dir: Path to save CSVs
        """
        download_dir.mkdir(parents=True, exist_ok=True)
        
        options = Options()
        options.add_experimental_option("prefs", {
            "download.default_directory": str(download_dir),
            "download.prompt_for_download": False,
            "download.directory_upgrade": True,
        })
        # Uncomment for headless mode (CI/CD)
        # options.add_argument("--headless")
        
        driver = webdriver.Chrome(ChromeDriverManager().install(), options=options)
        
        try:
            if self.bank == "anz":
                return self._download_anz(driver, start_date, end_date, download_dir)
            elif self.bank == "rbc":
                return self._download_rbc(driver, start_date, end_date, download_dir)
        except Exception as e:
            logger.error(f"Error downloading from {self.bank}: {e}")
            raise
        finally:
            driver.quit()

    def _download_anz(self, driver, start_date, end_date, download_dir):
        """
        Download CSV from ANZ Online Banking.
        
        Steps:
        1. Navigate to ANZ login
        2. Login with credentials
        3. Navigate to transactions
        4. Set date range
        5. Export as CSV
        """
        logger.info(f"Downloading ANZ transactions from {start_date} to {end_date}")
        
        # Navigate to ANZ
        driver.get("https://www.anz.com.au")
        wait = WebDriverWait(driver, 10)
        
        # Look for login button (may vary)
        try:
            login_btn = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Log in')]")))
            login_btn.click()
        except Exception as e:
            logger.warning(f"Could not find login button: {e}")
        
        # Wait for username field
        try:
            username_field = wait.until(EC.presence_of_element_located((By.NAME, "userName")))
            username_field.send_keys(self.username)
            logger.info("Entered username")
        except Exception as e:
            logger.error(f"Could not find username field: {e}")
            raise
        
        # Enter password
        try:
            password_field = driver.find_element(By.NAME, "password")
            password_field.send_keys(self.password)
            logger.info("Entered password")
        except Exception as e:
            logger.error(f"Could not find password field: {e}")
            raise
        
        # Click login
        try:
            login_submit = driver.find_element(By.XPATH, "//button[@type='submit']")
            login_submit.click()
            logger.info("Clicked login")
            time.sleep(5)  # Wait for 2FA if needed
        except Exception as e:
            logger.error(f"Could not submit login: {e}")
            raise
        
        # Navigate to transactions/statements
        try:
            driver.get("https://www.anz.com.au/digital/transactions")
            wait.until(EC.presence_of_element_located((By.XPATH, "//div[@role='main']")))
            logger.info("Navigated to transactions")
        except Exception as e:
            logger.warning(f"Could not navigate to transactions: {e}")
        
        # Set date range and export
        try:
            # Set start date
            start_input = driver.find_element(By.NAME, "fromDate")
            start_input.clear()
            start_input.send_keys(start_date.strftime("%d/%m/%Y"))
            
            # Set end date
            end_input = driver.find_element(By.NAME, "toDate")
            end_input.clear()
            end_input.send_keys(end_date.strftime("%d/%m/%Y"))
            
            logger.info(f"Set date range: {start_date} to {end_date}")
        except Exception as e:
            logger.warning(f"Could not set date range: {e}")
        
        # Find and click export button
        try:
            export_btn = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Export')] | //button[contains(text(), 'Download')]")))
            export_btn.click()
            logger.info("Clicked export")
            time.sleep(3)  # Wait for download
        except Exception as e:
            logger.warning(f"Could not find export button: {e}")
        
        logger.info(f"ANZ download complete - check {download_dir}")

    def _download_rbc(self, driver, start_date, end_date, download_dir):
        """
        Download CSV from RBC Online Banking.
        
        Steps:
        1. Navigate to RBC login
        2. Login with credentials
        3. Navigate to accounts
        4. Select account
        5. Set date range
        6. Export as CSV
        """
        logger.info(f"Downloading RBC transactions from {start_date} to {end_date}")
        
        # Navigate to RBC
        driver.get("https://www.rbcbank.com")
        wait = WebDriverWait(driver, 10)
        
        # Look for login link
        try:
            login_link = wait.until(EC.element_to_be_clickable((By.XPATH, "//a[contains(text(), 'Log in')]")))
            login_link.click()
        except Exception as e:
            logger.warning(f"Could not find login link: {e}")
        
        # Wait for username field
        try:
            username_field = wait.until(EC.presence_of_element_located((By.ID, "username")))
            username_field.send_keys(self.username)
            logger.info("Entered username")
        except Exception as e:
            logger.error(f"Could not find username field: {e}")
            raise
        
        # Enter password
        try:
            password_field = driver.find_element(By.ID, "password")
            password_field.send_keys(self.password)
            logger.info("Entered password")
        except Exception as e:
            logger.error(f"Could not find password field: {e}")
            raise
        
        # Click login
        try:
            login_btn = driver.find_element(By.XPATH, "//button[contains(text(), 'Log In')]")
            login_btn.click()
            logger.info("Clicked login")
            time.sleep(5)  # Wait for 2FA if needed
        except Exception as e:
            logger.error(f"Could not submit login: {e}")
            raise
        
        # Navigate to accounts
        try:
            driver.get("https://www.rbcbank.com/myaccount")
            wait.until(EC.presence_of_element_located((By.XPATH, "//div[@class='accounts']")))
            logger.info("Navigated to accounts")
        except Exception as e:
            logger.warning(f"Could not navigate to accounts: {e}")
        
        # Select first account (or specific account)
        try:
            account = wait.until(EC.element_to_be_clickable((By.XPATH, "//div[@class='account-item'][1]")))
            account.click()
            logger.info("Selected account")
            time.sleep(2)
        except Exception as e:
            logger.warning(f"Could not select account: {e}")
        
        # Set date range and export
        try:
            # Set start date
            start_input = driver.find_element(By.NAME, "startDate")
            start_input.clear()
            start_input.send_keys(start_date.strftime("%m/%d/%Y"))
            
            # Set end date
            end_input = driver.find_element(By.NAME, "endDate")
            end_input.clear()
            end_input.send_keys(end_date.strftime("%m/%d/%Y"))
            
            logger.info(f"Set date range: {start_date} to {end_date}")
        except Exception as e:
            logger.warning(f"Could not set date range: {e}")
        
        # Find and click export button
        try:
            export_btn = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Export')] | //button[contains(text(), 'Download')] | //a[contains(text(), 'CSV')]")))
            export_btn.click()
            logger.info("Clicked export")
            time.sleep(3)  # Wait for download
        except Exception as e:
            logger.warning(f"Could not find export button: {e}")
        
        logger.info(f"RBC download complete - check {download_dir}")


# Example usage:
if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    from datetime import datetime, timedelta
    
    # Set env vars: export ANZ_USERNAME=... ANZ_PASSWORD=...
    # Or pass directly: BankDownloader("anz", username="...", password="...")
    
    try:
        downloader = BankDownloader("anz")
        start = datetime.now() - timedelta(days=30)
        end = datetime.now()
        download_dir = Path("./bank_downloads")
        downloader.download_csv(start, end, download_dir)
    except Exception as e:
        logger.error(f"Failed: {e}")
