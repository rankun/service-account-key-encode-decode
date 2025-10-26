## JSON Encoder / Decoder Base64

## Easy to use Service Account from Google Cloud as a JSON ENV: https://service-account-key-encode-decode.vercel.app/

## Run Locally

**Prerequisites:**  Node.js

1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## How to get a service account key

A Google Cloud service account is a special Google account used by applications and virtual machines (VMs) to make authorized API calls. The most common ways to create and generate keys for a service account are through the Google Cloud Console, the gcloud command-line tool, or with an Infrastructure-as-Code tool like Terraform. 
Method 1: Using the Google Cloud Console
This method is best for manual creation and for users who prefer a graphical user interface.
Navigate to Service Accounts: In the Google Cloud Console, go to the IAM & Admin menu and select Service Accounts.
Create a Service Account: Click + Create Service Account.
Enter Details: Provide a Service account name and a description. The Service account ID is generated automatically but can be edited. Click Create and continue.
Grant Access: Assign the necessary IAM roles to the service account to specify the project resources it can access. Click Continue.
Grant User Access (Optional): Grant other users or groups permission to use this service account for their workloads. Click Done.
Create a Key: After creation, click on the service account's email address in the list. Go to the Keys tab, click Add Key, and then Create new key.
Choose Key Type: Select JSON as the key type. The key file will automatically download to your computer. Store this file securely, as it is the only copy. 
Method 2: Using the gcloud command-line tool
This method is ideal for automation and scripting, and for users who prefer working in a terminal.
Open Cloud Shell: The Google Cloud console has a built-in terminal called Cloud Shell, with the gcloud tool pre-installed.
Create the Service Account: Run the following command, replacing SERVICE_ACCOUNT_NAME with a name for the account and adding a display name and description.
sh
gcloud iam service-accounts create SERVICE_ACCOUNT_NAME \
    --description="DESCRIPTION" \
    --display-name="DISPLAY_NAME"


Example:
sh
gcloud iam service-accounts create my-test-sa \
    --description="Service account for testing" \
    --display-name="Test Service Account"


Grant Permissions (Optional): To grant the service account permissions to a resource, bind a role to it.
sh
gcloud projects add-iam-policy-binding PROJECT_ID \
    --member="serviceAccount:SERVICE_ACCOUNT_NAME@PROJECT_ID.iam.gserviceaccount.com" \
    --role="ROLE_NAME"


Example:
sh
gcloud projects add-iam-policy-binding my-project-123 \
    --member="serviceAccount:my-test-sa@my-project-123.iam.gserviceaccount.com" \
    --role="roles/viewer"
Use o código com cuidado.

Create a Key: To generate and download a key file, run:
sh
gcloud iam service-accounts keys create KEY_FILE --iam-account=SERVICE_ACCOUNT_NAME@PROJECT_ID.iam.gserviceaccount.com


Example:
sh
gcloud iam service-accounts keys create ~/my-test-sa-key.json \
    --iam-account=my-test-sa@my-project-123.iam.gserviceaccount.com


 
Method 3: Using Terraform
This method is suited for managing your cloud infrastructure as code, ensuring repeatable and versioned configurations.
Configure the google_service_account resource: In your Terraform configuration file (.tf), define a google_service_account resource. Replace the example account_id and display_name with your own values.
terraform
resource "google_service_account" "service_account" {
  account_id   = "my-terraform-sa"
  display_name = "Terraform Service Account"
}


Generate a Key (Optional): To generate a key for the service account and save it to a file, add a google_service_account_key resource.
terraform
resource "google_service_account_key" "service_account_key" {
  service_account_id = google_service_account.service_account.name
}

resource "local_file" "service_account_key_file" {
  content  = base64decode(google_service_account_key.service_account_key.private_key)
  filename = "my-terraform-sa-key.json"
}


This example uses a local_file resource to write the decoded key to a JSON file.
Initialize and Apply: Run the terraform init and terraform apply commands to create the resources. 
Important security considerations
Protect your keys: Treat your service account keys as sensitive data. Do not store them in public repositories like Git. Consider using a secret manager, such as Google Cloud's Secret Manager, to protect them.
Limit permissions: Always follow the principle of least privilege by granting a service account only the roles and permissions necessary for its intended purpose.
Use short-lived credentials: For some use cases, it's safer to use service account impersonation or other methods that don't require static key files. This is often recommended for applications running on Google Cloud infrastructure like Compute Engine and Cloud Run. 
