---
title: Azure Build Pipeline .NET apps
description: Azure Build Pipeline .NET apps
date: 2024-05-02
tags:
  - tech recipe
  - azure devops
  - .NET
---

Azure Devops pipelines are writen in yaml.

Pipeline start with a definition of what triggers the build. The following will trigger on check ins to the dev branch for Project1, Project2 and Project_Shared_Libs. 

```yaml
trigger:
  branches:
    include:
      - dev
  paths:
    include:
      - Solution/Project1_Frontend/**
      - Solution/Project2_Frontend/**
      - Solution/Project_Shared_Libs/**
```

The pool identifies what type of vm is to be used, and if it hosted by you or Microsoft.

Windows
```yaml
pool:
  vmImage: 'windows-latest'
```
Linux
```yaml
pool:
  vmImage: 'ubuntu-latest'
```
Self hosted.
```yaml
pool: your-pool-name
``` 

Use the variables section to parameterize build configurations and link to Azure Varialbe Group Library that can supply sensitive data.
```yaml
variables:
- group: NAME_OF_VARIABLE_GROUP_LINK
- name: solution
  value: '**/*.sln'
- name: buildPlatform
  value: 'Mixed Platforms' #note 'Any CPU' for solutions and 'AnyCPU' for .csproj.
- name: buildConfiguration
  value: 'Release'
- name: repoName # Usefull if checking out more than one repository
  value: 'REPO-NAME' 
- name: SomeAppSetting
  value: 'net.tcp://localhost:8080/{0}'

```

Stages group a set of operations [jobs] for the pipeline to execute. Note that if your using multi-stages, each stage will pull a copy of the repository. A potentially time consuming operation.

```yaml
- stage: Build
  condition: always()
  jobs:
    - job:
      steps:
      - checkout: self
        clean: true
        fetchDepth: 2
      - checkout: git://Project/Another_Repository
```
By default, builds are named with just datetime. The build output can be re-named to use sematic versioning and other text. This help clarify where this code was generated from. (ex. A pull request.) Here we name the builds with Major.Minor.Branch.PRMessage. 

Note that 'Build.Reason' == 'PullRequest' will only be true if the build was triggered by PR policy (a background build that must pass before a pr **can** be completed). This is not the same as a build that happened due to a PR that **was** completed.

Here we use serveral devops and scripting concepts:
- conditions
- equality checks
- using step variables
- reading and writing to vso environment variables
- using regex to clean the PR message of illegal characters.

```yaml
- stage:
  displayName: Build_Branch_Version_Number
  condition: ne(variables['Build.SourceBranch'], 'refs/heads/main')
  jobs:
  - job: Build_Branch_Version_Number
    variables:
       prpatch: $[counter(variables['system.pullrequest.pullrequestid'],0)]
       brpatch: $[counter(variables['build.sourcebranchname'], 0)]
    steps:
      - task: PowerShell@2
        inputs:
          targetType: 'inline'
          script: 'Write-Host   "##vso[build.addbuildtag]$(EnvironmentTag)"'
        name: SetEnvironmentTag
      - task: PowerShell@2
        inputs:
          targetType: 'inline'
          script: |
            $sourceMessage = '$(Build.SourceVersionMessage)'
            $sourceMessage = $sourceMessage -replace '"|\.|\/|:|\?|@|\<|\>|\\', ''
            Write-Host "##vso[build.updatebuildnumber]$(major).$(minor)-PullRequest.$(prpatch).$sourceMessage"
        condition: eq(variables['Build.Reason'], 'PullRequest')
        name: SetPRBuildName
      - task: PowerShell@2
        inputs:
          targetType: 'inline'
          script: |
            $sourceMessage = '$(Build.SourceVersionMessage)'
            $sourceMessage = $sourceMessage -replace '"|\.|\/|:|\?|@|\<|\>|\\', '' 
            Write-Host "##vso[build.updatebuildnumber]$(major).$(minor)-$(Build.SourceBranchName).$sourceMessage"
        condition: ne(variables['Build.Reason'], 'PullRequest')
        name: SetBranchBuildName
```

Here we build the entire visual studio solution output to the \Bin directory. Note the use of build configuration parameters.


```yaml
- task: VSBuild@1
        inputs:
          solution: '$(solution)'
          msbuildArgs: '/p:DeployOnBuild=true /p:WebPublishMethod=Package /p:PackageAsSingleFile=true /p:SkipInvalidConfigurations=true /p:PackageLocation="$(Build.SourcesDirectory)\Bin"'
          platform: '$(buildPlatform)'
          configuration: '$(buildConfiguration)'
```

Msbuild is the core technology that compiles and packages the projects. There are many build arguments to direct MSBuild. Note that the /p args 

/p:DeployOnBuild=true 
/p:WebPublishMethod=Package 
/p:PackageAsSingleFile=true 
/p:SkipInvalidConfigurations=true 
/p:PackageLocation="$(build.artifactstagingdirectory)

are actually direct mappings the the .csproj property groups.
```xml
<Project ToolsVersion="12.0" DefaultTargets="Build" xmlns="http://schemas.microsoft.com/developer/msbuild/2003">
  <PropertyGroup>
    <Configuration Condition=" '$(Configuration)' == '' ">Debug</Configuration>
    <Platform Condition=" '$(Platform)' == '' ">x86</Platform>
    ...
```

<[More about msbuild](https://learn.microsoft.com/en-us/visualstudio/msbuild/msbuild-reference?view=vs-2022)>

<[More about msbuild args.](https://learn.microsoft.com/en-us/previous-versions/aspnet/ff398069(v=vs.110)?redirectedfrom=MSDN)>

<[more about devops agents](https://learn.microsoft.com/en-us/azure/devops/pipelines/agents/hosted?view=azure-devops&tabs=yaml)>




<a href="/case-studies/case-study-tfs-to-git">Back to Case Study</a>