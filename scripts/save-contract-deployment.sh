#!/bin/bash

deploymentName=$1

deploymentFolder="./deployments/${deploymentName}"
echo "Creating folder ${deploymentFolder}";
mkdir $deploymentFolder

echo "Moving artifacts and contract state to ${deploymentFolder}"
cp -r ./artifacts $deploymentFolder/artifacts
cp state.json $deploymentFolder/state.json

cp .openzeppelin/unknown-31.json .openzeppelin/${deploymentName}-31.json
