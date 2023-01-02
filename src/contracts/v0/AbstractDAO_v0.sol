pragma solidity ^0.5.8;

import '@openzeppelin/contracts-ethereum-package/contracts/ownership/Ownable.sol';
import '@openzeppelin/contracts/math/SafeMath.sol';
import '@openzeppelin/upgrades/contracts/Initializable.sol';

/// @title A DAO contract based on MolochDAO ideas
contract AbstractDAO_v0 is Initializable {
    using SafeMath for uint256;

    /// DAO members
    mapping(address => Member) public members;
    /// Array of DAO proposals inlcuding already processed ones
    Proposal[] public proposalQueue;
    /// DAO's name.
    string public name;
    uint256 public creationTime;

    enum ProposalType {
        NewMember, /// Adds a new member to the DAO
        NewDAO, /// Create a new dao
        AssignBank, /// Assigns bank role to a member
        AssignCurator /// Assigns curator role to a member
    }

    enum Role {Normal, Bank, Curator}

    uint256 public periodDuration; /// seconds
    uint256 public votingPeriodLength; /// periods
    uint256 public gracePeriodLength;
    uint256 public processingPeriodLength;

    /// Emitted then a proposal was successfuly submitted
    event SubmitProposal(
        uint256 proposalIndex,
        address indexed memberAddress,
        address indexed applicant,
        ProposalType indexed proposalType
    );
    /// Emitted when a vote was succesfuly received
    event SubmitVote(
        uint256 indexed proposalIndex,
        address indexed memberAddress,
        uint8 vote
    );
    /// Emitted when a proposal was successfuly been processed
    event ProcessProposal(
        uint256 indexed proposalIndex,
        address indexed applicant,
        address indexed memberAddress,
        ProposalType proposalType,
        bool didPass
    );

    enum Vote {Null, Yes, No}

    struct Member {
        Role role; /// Member current role
        bool exists; /// To check if it exists in the mapping
        uint256 shares; /// Amount of shares
    }

    struct Proposal {
        address proposer; /// Member that sent the proposal
        address applicant; ///
        ProposalType proposalType; /// The type of the proposal being voted
        uint256 yesVotes; /// Total amount of Yes votes
        uint256 noVotes; /// Total amount of No votes
        bool didPass; /// True if the proposal has been approved, no otherwise
        string description; /// ipfs / rif storage hash
        mapping(address => Vote) votesByMember; /// All the votes made for this proposal
        uint256 startingPeriod; /// the period in which voting can start for this proposal
        bool processed; /// True if it has been processed, false otherwise
    }

    /**
     * @param _name DAO name
     * @param _creator User that will be assigned as the first member
     */
    function initialize(
        string memory _name,
        address _creator
    ) public initializer {
        name = _name;
        creationTime = now;
        addMember(_creator);
        periodDuration = 17280;
        votingPeriodLength = 35; /// periods
        gracePeriodLength = 35;
        processingPeriodLength = votingPeriodLength + gracePeriodLength;
    }

    /**
     * @notice Function to be invoked in order to create a new proposal.
     *
     * @param _applicant Address of the user to be added as member. If _proposalType is NewDAO _applicant will be added as the first member.
     * @param _proposalType Type of the proposal to be voted
     * @param _description String description about the proposal
     */
    function submitProposal(
        address _applicant,
        uint8 _proposalType,
        string memory _description
    ) public onlyMembers() {
        ProposalType proposalType = ProposalType(_proposalType);
        require(_proposalType < 4, 'invalid type');
        requireProposalTypeIsValid(proposalType);

        if (
            proposalType == ProposalType.AssignBank ||
            proposalType == ProposalType.AssignCurator
        ) {
            requireIsMember(_applicant);
        }

        address memberAddress = msg.sender;
        uint256 startingPeriod = max(
            getCurrentPeriod(),
            proposalQueue.length == 0
                ? 0
                : proposalQueue[proposalQueue.length.sub(1)].startingPeriod
        )
            .add(1);
        Proposal memory proposal = Proposal({
            proposer: memberAddress,
            description: _description,
            proposalType: proposalType,
            applicant: _applicant,
            yesVotes: 0,
            noVotes: 0,
            didPass: false,
            startingPeriod: startingPeriod,
            processed: false
        });

        proposalQueue.push(proposal);

        emit SubmitProposal(
            proposalQueue.length.sub(1),
            memberAddress,
            _applicant,
            proposalType
        );
    }

    /**
     * @notice Used to cast a vote. Keep in mind that only memers can vote, voting twice is not alloed and votes cannot be casted between starting period until expiration.
     * @param _proposalIndex Proposal to be voted to. It will revert if proposal doesn't exist at _propsoalIndex.
     * @param _vote The vote, Vote.Yes or Vote.No
     */
    function submitVote(uint256 _proposalIndex, uint8 _vote)
        public
        onlyMembers()
    {
        address memberAddress = msg.sender;
        require(
            _proposalIndex < proposalQueue.length,
            'Moloch::submitVote - proposal does not exist'
        );
        Proposal storage proposal = proposalQueue[_proposalIndex];
        Vote vote = Vote(_vote);
        require(
            vote == Vote.Yes || vote == Vote.No,
            'vote must be either Yes or No'
        );
        require(
            getCurrentPeriod() >= proposal.startingPeriod,
            'voting period has not started'
        );

        require(
            !hasVotingPeriodExpired(proposal.startingPeriod),
            'proposal voting period has expired'
        );
        require(
            proposal.votesByMember[memberAddress] == Vote.Null,
            'member has already voted on this proposal'
        );

        // store user vote
        proposal.votesByMember[memberAddress] = vote;

        // count the vote in the corresponding proposal vote accumulator
        Member storage member = members[memberAddress];
        if (vote == Vote.Yes) {
            proposal.yesVotes = proposal.yesVotes.add(member.shares);
        } else if (vote == Vote.No) {
            proposal.noVotes = proposal.noVotes.add(member.shares);
        }

        emit SubmitVote(_proposalIndex, memberAddress, _vote);
    }

    /**
     * @notice Counts proposal votes and executes corresponding actions if Yes votes > No votes. If it didn't pass does nothing. Proposals can be processed just once.
     * @param _proposalIndex Proposal to ben processed. Previous proposals (the ones with index less than _proposalIndex) need to be processed first
     */
    function processProposal(uint256 _proposalIndex)
        public
        canProcess(_proposalIndex)
    {
        Proposal storage proposal = proposalQueue[_proposalIndex];

        proposal.processed = true;

        bool didPass = proposal.yesVotes > proposal.noVotes;

        if (didPass) {
            proposal.didPass = true;
            // TODO: We might emit event or something to give more feedback to the users
            bool memberExist = members[proposal.applicant].exists;
            ProposalType proposalType = proposal.proposalType;

            if (proposalType == ProposalType.NewMember && !memberExist) {
                addMember(proposal.applicant);
            } else if (proposalType == ProposalType.AssignBank && memberExist) {
                members[proposal.applicant].role = Role.Bank;
            } else if (
                proposalType == ProposalType.AssignCurator && memberExist
            ) {
                members[proposal.applicant].role = Role.Curator;
            } else if (proposalType == ProposalType.NewDAO) {
                processNewDaoProposal(proposal.description, proposal.applicant);
            }
        }

        emit ProcessProposal(
            _proposalIndex,
            proposal.applicant,
            proposal.proposer,
            proposal.proposalType,
            didPass
        );
    }

    /**
     * @notice Returns current period. It can be used to determine the actions that can be performed on a proposal (cast votes or process).
     */
    function getCurrentPeriod() public view returns (uint256) {
        return now.sub(creationTime).div(periodDuration);
    }

    /**
     * @notice Returns true if the voting has expired based on the current period
     * @param startingPeriod Proposal staring period
     */
    function hasVotingPeriodExpired(uint256 startingPeriod)
        public
        view
        returns (bool)
    {
        return getCurrentPeriod() >= startingPeriod.add(votingPeriodLength);
    }

    /**
     * @notice Returns the proposals array length
     */
    function getProposalQueueLength() public view returns (uint256) {
        return proposalQueue.length;
    }

    /**
     * @notice Checks if a proposal can be processed or not. Checks to be made: proposal exists, if it's ready to be processed and has not expired and hasn't been yet processed. It also checks if the previoous proposal has been processed already.
     */
    modifier canProcess(uint256 proposalIndex) {
        require(
            proposalIndex < proposalQueue.length,
            'proposal does not exist'
        );
        Proposal storage proposal = proposalQueue[proposalIndex];

        require(
            getCurrentPeriod() >=
                proposal.startingPeriod.add(processingPeriodLength),
            'proposal is not ready to be processed'
        );
        require(
            proposal.processed == false,
            'proposal has already been processed'
        );
        require(
            proposalIndex == 0 || proposalQueue[proposalIndex.sub(1)].processed,
            'previous proposal must be processed'
        );
        _;
    }

    /**
     * @notice This modifier checks if the `msg.sender` corresponds to a member of the dao with voting power
     */
    modifier onlyMembers() {
        requireIsMember(msg.sender);
        _;
    }

    /**
     * @dev Checks if the given address belongs to a member. It reverts otherwise.
     * @param _address to be checked
     */
    function requireIsMember(address _address) private view {
        Member storage member = members[_address];
        require(member.exists == true, 'not a DAO member');
    }

    function addMember(address memberAddress) private {
        Member memory member = Member({
            role: Role.Normal,
            exists: true,
            shares: 1
        });
        members[memberAddress] = member;
    }

    function max(uint256 x, uint256 y) internal pure returns (uint256) {
        return x >= y ? x : y;
    }

    /**
     * @dev Checks if the proposal is valid to be processed by this DAO. It must revert if not.
     * @param _proposalType ProposalType to be checked against to
     */
    function requireProposalTypeIsValid(ProposalType _proposalType) internal;

    /**
     * @dev Processes a new dao proposal. If not supported by the DAO type, it should do nothing
     * @param _name DAO name
     * @param _applicant Account to be set as a first member of the dao
     */
    function processNewDaoProposal(string memory _name, address _applicant)
        internal;

    uint256[50] private _gap;
}
