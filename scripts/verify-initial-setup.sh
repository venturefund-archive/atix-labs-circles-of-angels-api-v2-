# Dependencies 
echo "############## Install dependencies ##############"

sudo apt install -y postgresql-client whois jq


# export env vars
echo "############## Exporting env vars from ../.env file ##############"
set -a # automatically export all variables
source ../.env
set +a

# DB is running?
echo "############## Checking database connection ##############"
pg_isready -d $DB_NAME -h $DB_HOST -p $DB_PORT -U $DB_USER                      

# check domains
echo "############## Checking frontend domain ##############"
whois $FRONTEND_URL | grep "No match for domain"

# check email provider credentials
echo "############## Checking email provider credentials  ##############"

ADMIN_EMAIL=`cat ../setup-config.json | jq -r ".email"`
curl -i --request POST \
--url https://api.sendgrid.com/v3/mail/send \
--header "Authorization: Bearer $EMAIL_API_KEY" \
--header 'Content-Type: application/json' \
--data "{\"personalizations\": [{\"to\": [{\"email\": $ADMIN_EMAIL}]}],\"from\": {\"email\": $EMAIL_FROM},\"subject\": \"City of Angels Configuration!\",\"content\": [{\"type\": \"text/plain\", \"value\": \"Your SendGrid API is ok!\"}]}"



# check node is ok
echo "############## Checking blockchain connection ##############"


#check file server is ok
echo "############## Checking file server status ##############"
