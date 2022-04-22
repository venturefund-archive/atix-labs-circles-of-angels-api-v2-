## DB Models
* All the schemas have a unique id in their table, and date of creation and update




### User:
_Represents a user of Circles Of Angels, it can be: Social Entrepreneur, Project Supporter,
Project Curator, Bank operator, COA Administrator_
  ##### Attributes:
  - `id`: user id in the business domain
  - `name`: user's name displayed
  - `email`: email with which the user is registered
  - `pwd`: password with which the user logs
  - `roles`: role / roles that the user has in the tool (this can be for example Funder and Oracle at the same time)  

----
### Project:
_Represents a project of Circles Of Angels_
  ##### Attributes:
  - `id`: id of the project in the business domain
  - `projectName`: name with which the user will be shown
  - `ownerId`: project creator user's id
  - `mission`: project mission
  - `problemAddressed`: problem addressed by the project
  - `location`: geographical location where the project will be developed
  - `timeframe`: project time duration
  - `coverPhoto`: project cover image
  - `cardPhoto`: project icon
  - `status`: current project status
  - `goalAmount`: amount of money needed from the project
  - `faqLink`: link to the FAQ page
  - `pitchProposal`: initial proposal of the project
  - `milestonesFile`: excel file of milestones
  - `projectAgreement`: project consensus file

----

### Project Status:
_Represents the status of a particular project_
  ##### Attributes:
  - `name`: name of the state
  - `status`: numerical representation of the state

----


### User Project:
_Represents a relationship between a user and a project_
  ##### Attributes:
  - `status`: state in which the user is with respect to a project
  - `userId`: user id
  - `projectId`: project id


----

### Milestone:
_Represents a milestone of a project in a given quearter_
  ##### Attributes:
  - `id`: milestone id
  - `projectId`: id of the project to which it belongs
  - `quarter`: quarter to which it belongs
  - `tasks`: tasks to be performed in the current milestone
  - `impact`: expected changes after the conclusion of the
  - `impactCriterion`: documentation activity or evidence of the impact achieved
  - `signsOfSuccess`: signs indicating that the activity was successful
  - `signsOfSuccessCriterion`: documentation or evidence that the activity was completed
  - `category`: category
  - `keyPersonnel`: member of the team responsible for each task to be performed
  - `budget`: project's budget in USD

----

### Activity:
_Represents an activity of a certain milestone_
  ##### Attributes:
  - `id`:
  - `milestoneId`: id of the milestone to which they belong
  - `tasks`: tasks to be performed in the current milestone
  - `impact`: expected changes after the conclusion of the
  - `impactCriterion`: documentation activity or evidence of the impact achieved
  - `signsOfSuccess`: signs indicating that the activity was successful
  - `signsOfSuccessCriterion`: documentation or evidence that the activity was completed
  - `category`: category
  - `keyPersonnel`: member of the team responsible for each task to be performed
  - `budget`: budget with which it is counted

----



### Fund Transfer:
_Represents a **bank transfer**, between **users** bank accounts of Circles of Angels_
  ##### Attributes:
  - `transferId`: unique id of the bank transfer made
  - `senderId`: id of the user who sends
  - `destinationAccount`: id of the user who receives
  - `projectId`: the project id to which this bank transfer belongs
  - `amount`: amount of money transferred
  - `currency`: currency in which the transfer was made

----

### Transfer Status:
_Represents the current status of a bank transfer_
  ##### Attributes:
  - `name`: name of the state
  - `status`: numerical representation of the state

----


### Configs:
_Represents a general configuration of the API_
  ##### Attributes:
  - `key`: unique key of a configuration
  - `value`: the value of this configuration