---
title: TFS to GIT code migration
description: TFS to GIT code migration
date: 2024-04-30
tags:
  - case study
---

## Examining a TFS to GIT code migration. ##


### Requirements

Legacy client code exists in a datacenter TFS server. Code should be migrated to Azure Devops git repository. CI/CD should be put in place and the dev team will adopt a basic git flow development process.

The basic architecture of the project is a 3 tier IIS web site deployment with .NET backend services and SQL data layer. Additionally, a proprietary 3rd party 'low code' platform is used to provide data structure, UI elements and business process management workflows.

### Technical Challenges

After spending time with the team and performing an analysis of the system and current processes, a number of challenges were presented.

#### TFS Repository Analysis
<!-- why is markdown=1 not working with 11ty?> https://v0-5-1.11ty.dev/docs/languages/markdown/-->
<div class="responsive-two-column-grid">
    <div>
    <h5>The code repository is intermixed with media, data and infrastructure files.</h5> 
    </div>
    <div>
    <h5>Why is this a problem?</h5>
    <p>
    A code repository is tracking text file changes over time and presenting history tracing and revert capabilities. Binary files present issues with these capabilities, inflate the repository and introduce inefficiencies into downstream processes. (long checkout times etc...)
      </p>
    <h5>Solution</h5>
    <p>
    Separate the repository into three and move media onto a file share. Use git LFS if necessary but prefer to manage media requirements through deployment processes. Repositories will split into CODE, INFRASTRUCTURE and DATA. 
    </p>
    </div>
</div>

<div class="responsive-two-column-grid">
  <div>
   <h5> Code, Build and Publish Issues. </h5>
  
  * Years of team turnover and technical debt have left a code base requiring basic house cleaning. Building and deploying straight from the repository impossible.
  * Build property issues.
    * Multiple project build outputs.
    * Incorrect Web.config references.
    * Incorrect build cpu directives
  * Passwords stored in configs.
  * Referenced image files are missing locally. This causes publishing to fail. 
  * Images stored in the project folders are not referenced in the VS solution. This causes the publishing to skip these files and not deploy them to the server. 
  * Many references to local / Windows GAC / and other installed applications. Some required files live in multiple locations. i.e. One application references the .dll in the GAC and another application references the same file at a local relative location.    
  * excessive build warnings (unused variables) hide potentially important information.
  * Secrets held in checked in configuration. 
  </div>
  <div>
    <h5>Why is this a problem?</h5>
    <p>
      A build server would need to replicate this messy, non-standard configuration in order to automatically build the code in a pipeline. Missing files would prevent a clean build.
    </p>
    <h5>Solution</h5>
    <p>
    <div>
    * Standardize  build outputs.
    * Fix the missing references.
    * Standardize solution references and utilize standard Nuget feeds.
    * Move secrets out of configuration and into a vault.
    </div>
    </p>
  </div>
</div>

As shown a history of technical debt needs addressing before attempting an automation pipeline.
Have you reviewed your system? Are you following best practices? Are you standing in your own way to the path of cicd?

#### Deployment Analysis

<div class="responsive-two-column-grid">
<div>
<h5>The existing deployment SOP is a manual process involving a TFS checkout, build and manual copy.</h5>
</div>
<div>
<h5>Why is this a problem?</h5>
 'Diff' software is used to copy changed/new files. This enables in-place 'fixes' (see above) to local and server locations to stay in place. (but not driven into the repository.)
<h5>Solution</h5>
The repository should be the source of truth. 
Environment specific changes captured into 'configuration' solutions (.config transfomations etc.) that will be driven by automation.
</div>
</div>

<div class="responsive-two-column-grid">
<div>
<h5>Backend services use a shared executable folder on the server.</h5>
</div>
<div>
<h5>Why is this a problem?</h5>
  The Server applications and some utility applications are run from the same directory and share a single configuration file and support dlls. Some applications require differing versions of support dlls.

<h5>Solution</h5>
Split these applications into different locations (fix the build configs) so they can maintain their own requirements.
</div>
</div>
<div class="responsive-two-column-grid">
<div>
<h5>Backend services are actually interactive desktop applications running in a signed in user context.</h5>
</div>
<div>
<h5>Why is this a problem?</h5>
  Automating the starting and stopping of the applications will be an issue.
  [todo] Some background on windows.  
</div>
</div>

<div class="responsive-two-column-grid">
<div>
<h5>Additional challenges to adress.</h5>
</div>
<div>
* Command line utilities for application data transform/load need to be run with differing command line arguments depending on type of data and if the data is new or being updated.
  * Scripts will be written to execute the utilities at deployment for all varieties of data population.
  * Scripts will need to examine the checked in code to determine data type and execution type.
  * Standard sql data scripts are manually executed in each environment to update database structure and content. 
    * Scripts should be written to be idempotent.
  * The existing deployment processes must be maintained while transitioning to automated deployment pipelines. 
    * This requires a full repository copy be dumped to a file share. The repository files must preserve the datetime of last check-in/alteration in order for 'diff' software to work. [todo] provide git file history issue background.
</div>
</div>

#### Developer workflow analysis
- No PR process or code reviews.  
- Onboarding of new members require many manual time intensive process. 
  - Large sql relational data (cleaned copies of production data sets) > 50GB must be requested for local dev.
  - Special requests to IT are needed to increase vm space to accommodate the large sql databas
- Solutions
  - Stipped down developer golden data set would be prefered.
  - Establish PR process. This would facilitate at least a minimum code review.
  - Have operations establish a proper vm image with tool chains and space requirements met. 

### Architectural Decisions 

- The applications are ASP.NET 4 and .NET Winform projects are deploying to Windows IIS servers. The client is utilizing Azure infrastructure and Azure Devops Tasks to run scrum iterations already. 
  - So we will use Azure Devops Git repositories and **<a href="/tech-recipes/az-devops-build-pipeline">Azure build/release pipelines.</a>**   
  - A deployment agent will be installed on a corporate vm with network access to Devops as well as dev/test servers.
  - Microsfot WebDepoy will be used for website **<a href="/tech-recipes/iis-deploy">distribution</a>**.
- git-tfs will be used to **<a href="/tech-recipes/tfs-migration">migrate</a>** code and history from TFS to Azure Devops Git repos.
- Together with internal leadership we will drive adoption and training for team members.
  - Git flow distributed development processes
  - Branching Strategies 
  - PR request processes
- House cleaning/fix list will be provided to team leads for internal tasking.
- Concurrently, the devops repos, artifacts and pipelines will be built.
- Periodic demos and team reviews will address issues and any additional needs. 
