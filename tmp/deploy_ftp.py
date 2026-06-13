import os
import sys
import ftplib

sys.stdout.reconfigure(encoding='utf-8')

HOST = '92.113.18.85'
USER = 'u358235412.info'
PASS = 'Tever3443!.'

BASE_DIR = r"c:\Users\Hp Victus\OneDrive - Istanbul Bilgi Universitesi\Masaüstü\teverorman-web"

FILES_TO_UPLOAD = [
    ("logo.svg", "logo.svg"),
    ("styles.css", "styles.css"),
    ("main.js", "main.js"),
    ("index.html", "index.html"),
    ("about.html", "about.html"),
    ("contact.html", "contact.html"),
    ("products.html", "products.html"),
    ("teversanat.html", "teversanat.html"),
    ("teversanat-gallery.html", "teversanat-gallery.html"),
    ("teversanat-apply.html", "teversanat-apply.html"),
    ("art.html", "art.html"),
    ("mentra.html", "mentra.html"),
    ("mentra-privacy.html", "mentra-privacy.html"),
    ("mentra-support.html", "mentra-support.html"),
    ("sitemap.xml", "sitemap.xml"),
    ("manifest.json", "manifest.json"),
    ("browserconfig.xml", "browserconfig.xml"),
    ("imzalar.html", "imzalar.html"),
    (".htaccess", ".htaccess")
]

def upload_files(ftp, target_name):
    print(f"\n--- Uploading to: {target_name} ---")
    # Check if assets folder exists on FTP in the current folder, if not create it
    try:
        ftp.cwd("assets")
        ftp.cwd("..")
    except:
        try:
            ftp.mkd("assets")
            print("Created assets directory on FTP.")
        except Exception as e:
            print(f"Failed to create assets directory: {e}")

    for local_rel_path, remote_path in FILES_TO_UPLOAD:
        local_path = os.path.join(BASE_DIR, local_rel_path)
        if not os.path.exists(local_path):
            print(f"Local file does not exist: {local_path}, skipping.")
            continue
            
        print(f"Uploading {local_rel_path} to {remote_path}...")
        try:
            with open(local_path, "rb") as f:
                ftp.storbinary(f"STOR {remote_path}", f)
            print(f"Uploaded successfully: {remote_path}")
        except Exception as e:
            print(f"Failed to upload {remote_path}: {e}")

def delete_files_to_remove(ftp, dir_name):
    print(f"\n--- Deleting obsolete files in {dir_name} ---")
    files_to_delete = [
        "prices.html",
        "assets/Tever Orman Fiyat Listesi.pdf",
        "assets/Tever Orman Export Price List.pdf",
        "assets/Tever_Orman_Poplar_Plywood_Quotation.pdf"
    ]
    for path in files_to_delete:
        try:
            ftp.delete(path)
            print(f"Deleted successfully: {path}")
        except Exception as e:
            print(f"Skipped / Failed to delete {path}: {e}")

def deploy():
    print(f"Connecting to Hostinger FTP server at {HOST}...")
    try:
        ftp = ftplib.FTP(HOST)
        ftp.login(USER, PASS)
        print("Logged in successfully.")
    except Exception as e:
        print(f"Connection failed: {e}")
        return

    # 1. Deploy to Root Directory
    try:
        ftp.cwd("/")
        delete_files_to_remove(ftp, "Root Directory (/)")
        upload_files(ftp, "Root Directory (/)")
    except Exception as e:
        print(f"Failed in Root Directory deployment: {e}")

    # 2. Deploy to teverorman-web Directory
    try:
        ftp.cwd("/")
        ftp.cwd("teverorman-web")
        delete_files_to_remove(ftp, "teverorman-web Directory (/teverorman-web/)")
        upload_files(ftp, "teverorman-web Directory (/teverorman-web/)")
    except Exception as e:
        print(f"Failed in teverorman-web Directory deployment: {e}")

    ftp.quit()
    print("\nDouble deployment and clean-up completed successfully!")

if __name__ == "__main__":
    deploy()
