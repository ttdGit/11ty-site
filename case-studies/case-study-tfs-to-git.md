---
title: TFS to GIT code migration
description: TFS to GIT code migration
date: 2024-04-30
tags:
  - case study
---

## Examining a TFS to GIT code migration.

### Requirements

Legacy client code exists in a datacenter TFS server. Code should be migrated to Azure Devops git repository. CI/CD should be put in place and the dev team will adopt a basic git flow development process.

The basic characteristic of the project is a 3 tier web site deployment with backend services and SQL data layer. 

### Technical Challenges

After spending time with the team and performing an analysis of the system and current processes, a number of challenges were presented.

#### TFS Repository Analysis

- Intermixed code, media, date and infrastrucutre files in the same reporitory. 5 GB repository.

  - Why is this a problem?
    
   - A code repository is tracking text file changes over time and presenting history tracing and revert capabilities. Binary files present issues with these capabilities, inflate the repository and introduce inefficiances into down stream processes. (long checkout times etc...)

  - Solution. 
    - Seperate the repository into three and move media onto a file share. Use git LFS if necessary but prefer to manage media requirements through deployment processes. Repositories will split into CODE, INFRASTRUCTURE and DATA.
- Code, Build and Publish Issues
  - Years of team turnover and technical debt have left a code base requiring basic house cleaning. Building and deploying straight from the repository imposible.
  - Build properties.
  - Multiple project build outputs.
  - Incorrect Web.config references.
  - Passwords stored in configs.
  - Some referenced image files are missing locally. This causes publishing to fail. 
  - Some images are in the local project structure but not referenced in the VS solution. This causes the Publishing to skip these files and not deploy them to the server. 
  - Many references to local / Windows GAC / and other installed applications. Some required files live in multiple locations. i.e. One application references the .dll in the GAC and another application references the same file at a local relative location. 
    - Why is this a problem?
    - A build server would need to replicate this messy, non-standard configuration in order to automatically build the code in a pipeline. Missing files would prevent a clean build.
  - excessive build warnings (unused variables) hide potentially important information.
  - Secrets held in checked in configuration.
  - Solutions
    - Stadardize build outputs.
    - Fix the missing references.
    - Standardize solution references and utilize standard nuget feeds.
    - Move secrets out of configuration and into a vault.

As shown a history of technical debt needs addressing before attempting an automation pipeline.
Have you reviewed your system? Are you following best practices?

#### Deployment Analysis

The existing deployment SOP is a manual process involving a TFS checkout, build and copy. Diff software is used to copy changed/new files. This alsows fixes (see above) locally and to server locations to stay in place. (but not driven into the repository.) Lesson : repository should be the source of truth. Environment specific changes are captured and driven by automation.

Backend services use a shared executable folder on the server.
- The Server applications and some utility applications are run from the same directory and share a single configuration file and support dlls.
- Applications are starting to require differing versions of support dlls. 
  - Solution
    - Split these applications into different locations so they can maintain their own requirements.

Backend services are actually interactive desktop applications running in a signed in user context.
- Why is this a problem?
  - Automating the starting and stopping of the applications will be an issue. 

Command line utilities for application data transform/load need to be run with differing command line arguments depending on type of data and if the data is new or being updated.
- Scripts will be writen to execute the utilities at deployment for all varieties of data population.
- Scripts will need to examine the checked in code to determine data type and execution type.

Standard sql data scripts are run. 
- Scripts should be written to be idempotent.

Legacy deployment requiring file datetime of last checking/alteration.

#### Developer workflow analysis
- No PR process or code reviews.
- Onboarding of new members require many manual time intensive process. 
  - Large sql relational data (cleaned copies of production data sets) > 50GB must be requested for local dev.
  - Special requests for vm space to accomodate.
- Solutions
  - Stipped down developer golden data set would be prefered.
  - Establish PR process. This would facilitate at least a minimum code review.
  - Have operations establish a proper vm image with tool chains and space requirements met. 

### Architectural Decisions 

- The applications are **ASP.NET 4** and **NET Winform** projects deploying to Windows **IIS** servers. The client is utilizing Azure infrastructure and Azure Devops Tasks to run scrum iterations already. 
  - So we will use **Azure Devops** Git repositories and **Azure** **<a href="/tech-recipes/az-devops-build-pipeline">build</a>**/release pipelines. 
  - A deployment agent will be installed on a corporate vm with network access to Devops as well as dev/test servers.
  - Microsfot WebDepoy will be used for website **<a href="/tech-recipes/iis-deploy">distribution</a>**.
- **git-tfs** will be used to **<a href="/tech-recipes/tfs-migration">migrate</a>** code and history from TFS to Azure Devops Git repos.
- Together with internal leadership we will drive adoption and training for team members.
  - Git flow distributed development processes
  - Branching Strategies 
  - PR request processes
- House cleaning/fix list will be provided to team leads for internal tasking.
- Concurrently, the devops repos, artifacts and pipelines will be built.
- Periodic demos and team reviews will address issues and any additional needs. 
