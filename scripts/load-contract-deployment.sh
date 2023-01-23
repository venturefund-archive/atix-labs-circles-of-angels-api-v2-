#!/bin/bash

deploymentName=$1

deploymentFolder="./deployments/${deploymentName}"
echo "Loading deployment from ${deploymentFolder}";

echo -n "This will delete current artifacts and state.json, are you sure? (y/n): "
read isSure
if [[ "${isSure}" == "y" ]]; then
    rm -r -f ./artifacts
    cp -r $deploymentFolder/artifacts ./artifacts

    rm -f state.json
    cp $deploymentFolder/state.json state.json

    rm -f .openzeppelin/unknown-31.json
    cp .openzeppelin/${deploymentName}-31.json .openzeppelin/unknown-31.json

    echo "Setupped deployment ${deploymentName}"
else
    echo "Doing nothing, selected no or invalid input"
fi
