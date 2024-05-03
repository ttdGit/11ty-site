---
title: IIS .NET stack deployment
description: IIS .NET stack deployment
date: 2024-05-01
tags:
  - case study
  - IIS
  - git
---

# Migrating TFS repos to git.

To import TFS history as well as the latest code; we use the utility ‘git-tfs’. https://github.com/git-tfs/git-tfs 


Example : 
We can use arguments to selectivlly pull history.

```bash
git tfs clone https://tf.fppaco.org/tfs/FPPA $/"FPPA Source/FW6Upgrade" TFS_CLONE_NEW --from=13678 --to=14681
```

This pulls the history in FW6Upgrade from change set 13678 to 14681 into a new git repository under subdirectory TFS_CLONE_NEW . This will take a few hours.
After git-tfs is finished, cd into the new repo directory and add the Devops Git origin.
-	git remote add origin git@ssh.dev.azure.com:v3/ORG/PROJECT/ REPO_NAME
-	Notice that SSH is used instead of HTTP. This is due to the large binary files in TFS and helps the upload process.

<a href="/case-studies/case-study-tfs-to-git">Back to Case Study</a>
