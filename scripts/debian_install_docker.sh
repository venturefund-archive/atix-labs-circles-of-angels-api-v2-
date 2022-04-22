sh_c='sh -c'
$sh_c "apt-get update"
$sh_c "apt-get install -y apt-transport-https ca-certificates curl gnupg lsb-release"
$sh_c "curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg"
$sh_c "echo \"deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/debian $(lsb_release -cs) stable\" | tee /etc/apt/sources.list.d/docker.list > /dev/null"
$sh_c "apt-get update"
$sh_c "apt-get install -y docker-ce docker-ce-cli containerd.io"
