const { signParameters } = require('./signatureHelpers.js');

const projectRegistryErrors = {
    projectAlreadyCreated: 'The project is already created',
    editingNonExistingProject: 'Project being edited doesn\'t exist',
    auditForNonExistingProposal: 'The pending edit doesn\'t exists',
    auditWithInvalidIpfsHash: 'The pending edit doesn\'t have the ipfs hash selected'
}

const proposeProjectEdit = async (
    coaContract,
    projectId,
    ipfsHash,
    proposerEmail,
    proposerSigner,
    senderSigner = null
) => {
    const authorizationSignature = signParameters(
        ["uint256", "string", "string"],
        [projectId, ipfsHash, proposerEmail],
        proposerSigner
    );

    if (!!senderSigner) {
        await coaContract
            .connect(senderSigner)
            .proposeProjectEdit(projectId, ipfsHash, proposerEmail, authorizationSignature);
    } else {
        // Use default sender
        await coaContract.proposeProjectEdit(projectId, ipfsHash, proposerEmail, authorizationSignature);
    }
}

module.exports = {
    projectRegistryErrors,
    proposeProjectEdit
}
