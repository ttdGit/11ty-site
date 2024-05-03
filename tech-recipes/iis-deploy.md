---
title: IIS .NET stack deployment
description: IIS .NET stack deployment
date: 2024-05-01
tags:
  - tech recipe
  - IIS
  - .NET
---


# Choosing the Right Approach to Web Deployment

Our devops deployment server running in Azure must be capable of deploying multiple websites to multiple environment servers ( dev, test, uat, prod) in an automatic unmanned method. The website packages are provided from build pipelines as developers make changes. These packages will be distributed across network boundries to ASP .NET 4 IIS endpoints.

Architecture decision. Due to the mix of ASP .NET projects and IIS hosting, the Microsoft Web Deploy utility makes sense as a core technology for distribution.

When you work with Web Deploy 2.0 or later, there are three main approaches you can use to get your applications or sites onto a web server. You can:

- Use the Web Deploy Remote Agent Service. This approach requires less configuration of the web server, but you need to provide the credentials of a local server administrator in order to deploy anything to the server.
- Use the Web Deploy Handler. This approach is a lot more complex and requires more initial effort to set up the web server. However, when you use this approach, you can configure IIS to allow non-administrator users to perform the deployment. The Web Deploy Handler is only available in IIS version 7 or later.
- Use offline deployment. This approach requires the least configuration of the web server, but a server administrator must manually copy the web package onto the server and import it through IIS Manager.

Here we are using Web Deploy Remote Agent Service for the dev and test environments. Higher environments (Production) may require Web Deploy Handler depending on infrastructure security.

After installing and administering the Web Deploy Remote Agent Service to the IIS Server, deployment management is made available via http://SERVER_NAME/MSDEPLOYAGENTSERVICE. An admin user/pwd is saved in a secret vault that only admins and the pipeline can access.

Example
```
endpoint = "http://${serverIpOrHostname}/MSDEPLOYAGENTSERVICE"
msdeploy.exe -source:package=$package `
     -verb:sync `
     -allowUntrusted `
     -dest:auto,ComputerName=`"$endpoint`",IncludeAcls=False,AuthType=NTLM `
     -setParam:name=`"IIS Web Application Name`",value=`"$iisWebsiteName`" `
     -disableLink:AppPoolExtension `
     -disableLink:ContentExtension `
     -disableLink:CertificateExtension
```
msdeploy has many configuration options.


<a href="/case-studies/case-study-tfs-to-git">Back to Case Study</a>