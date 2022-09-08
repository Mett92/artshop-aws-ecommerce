# What is Artshop

The aim of this project was to build a web application by using the Microservices archicture and to deploy it in the cloud by means of the _aws_ services.
Artshop is an e-commerce web app for those who want to sell and buy artworks. An amateur or professional artist that would like to make money with his creations can sign up in the system, create an insertion and wait for someone to buy it.
<br><br>
The main features of the app are:
- Sign-up
- Log-in
- Checking if user's requests are authorized (IPC)
- Catalogue of all artworks for sale
- Sale of an artwork
- Purchase of an artwork


# Technologies involved
<div align="center">
<img src="https://user-images.githubusercontent.com/71827432/181799244-7de4654a-10c7-4f49-ab1c-5b2b67097097.png" width="140">
<img src="https://user-images.githubusercontent.com/71827432/181802646-17e25bc7-fc5b-4354-832e-3426d19b29ac.png" width="180">
<img src="https://user-images.githubusercontent.com/71827432/181803015-f357c3bf-025e-4526-bd10-cf05826091a6.png" width="150">
<img src="https://user-images.githubusercontent.com/71827432/181803247-bdca2c72-46d6-441b-98d2-ca7e8afc02e2.png" width="150">
<img src="https://user-images.githubusercontent.com/71827432/181803673-ce7df6e7-f1dc-4ae5-9be5-7394d4dc62fe.png" width="200">

</div>
<br>

In this project I involved many technologies as: 
- **Node.js**: used as server application both in the backend apis and in the frontend;
- **Express** was used to build quickly the apis;
- **Docker**: employed to build the container images and push them to the ECR repository;
- **Json Web Token**: used as an authorization token;
- **React**: employed in the frontend part;
- **aws-sdk**: enabled me to use the _api_ which allows me to _read/store_ the images into the _S3 Bucket_;
- **MySQL** as DBMS.

Moreover, I used many npm packages.

# _aws_ services used
The main services I used are the following services:
- Elastic Container Service (ECS)
- Elastic Container Registry (ECR)
- CloudWatch
- Application Load Balancer
- Network Load Balancer
- API Gateway
- NAT Gateway
- AuroraDB

In order to push the images container to the _ECR Repository_ I used the _aws cli_.


# The Design of the application

## The software architectural style
In order to make my application scalable, I chose Indipendent Components with communicating processes of REST type.
The Indipendent components architecture chosen was Microservices. 
The main functionalities (or components) that came to light from the functional decomposing analysis are:
- _Authorization_ 
- _Authentication_
- _Catalogue_
- _Sales_
- _Payment_
- _Frontend_

I decided to pair the _Authorization_ and _Authentication_ functionalies, since they share a sensistive object, such as the secret key; used to create the authorization token and to check its validity.

## The system architectural style
- Three-tier architecture
- The client sends APIs requests in order to retrieve data and presents them to the user. 
- The application logic tier that retrieves data from the DB, processes them and sends the processed data to the client.
<div align="center">
<img src="https://user-images.githubusercontent.com/71827432/181805064-d9844431-9a57-4e64-a2fa-992a615410e6.png" width="400" >
</div>

## The chosen Inter-process communication (IPC) for the Authorization
With the _Json Web Token_ every service could have checked the token's validity, but for security reasons I decided to limit the liability of the services to their purpose only. In fact, order to enable every service to check the token's validity I should have spread, among every service, the _secret key_ of the _JWT_.

Therefore, bearing in mind the above consideration, in order to check whether a user’s request is authorized we need to ask the auth service for the  token’s validity. The diagram below describes how the IPC works. Each service that wants to check if a request is authorized uses the REST api offered by the auth service.
<div align="center">
<img src="https://user-images.githubusercontent.com/71827432/181808592-3f90d2fe-0153-4895-9e72-4bb59a659617.png" width="400">
</div>

# How the app is deployed in aws
In order to deploy the services in __ECS__ with __Fargate__ I proceeded with the following steps:
- _I created an ECS Cluster_
- _I created a repository in ECR, then I built the image with docker for each service, and I pushed it to the repository_
- _After that, I created a task definition for each service specifing the uri of the relative image_
- _I deployed each service specifing the task previously created, then I created a target group and an internal ALB, attaching it to the ALB_
- _I created two policies for each service, one for __scale-out__ and another for __scale-in__, each one with a CloudWatch alarm_. The selected metric for the autoscale was _requestContPerTarget_. This way I enabled the __autoscaling__ for each service.

The diagram below describes at glance how the entire system works. The diagram does not take into account the _Availability Zones_.

![application_schema drawio](https://user-images.githubusercontent.com/71827432/181809948-0dbe9762-2213-4b57-a648-77957a47ce60.png)

In order to keep my system more secure:
- I put every service in a _private subnet_;
- Each service has the _Application Load Balancer_ (ALB) defined as __internal__;
- Only the _Frontend service_ has the ALB exposed to Internet and this is the __entry point__ of the application;
- The _Frontend service_ acts as a __proxy__ for the api requests sent by the client (_react app_);
- The _API Gateway_ is declared __private__, it receives requests forwarded by the _Frontend_ service;

__Why use _NAT_?__ In order to pull the container images from the _ECR repository_ and therefore create the Fargate service, internet connection is required, since the Fargate service is located in a private subnet we need the internet gateway, in this case the NAT can be a solution.

Instead, in the image below we can see how a service is spread across the _Availability Zones_ and how CloudWatch's monitor works. In partiular, each service has a target group where its instance are spread by autoscaling mechanism triggered by the related CloudWatch alarm.

<div align="center">
<img src="https://user-images.githubusercontent.com/71827432/181814619-7df96cbb-2706-4bfb-a6f0-89da4c323303.png" width="800">
</div>

__Why three availability zones?__ In order to guarantee the availability, we need to run a number of instances in each availability zone such that if one AZ fails, we still have the number of instances that serve the requests optimally.
With two AZ we should run the optimal number of instances two times, while with three AZ, we can run a smaller number of them.

## A look at how _S3_ was integrated
### The Sales service
<div align="center">
<img src="https://user-images.githubusercontent.com/71827432/181816046-44f78b42-293e-4107-8c0a-3a2ceabe83f9.png" width="400">
</div>

The client makes a createInsertion request to the service sending all the information about the object that the user wants to sell (a title, a description, the dimensions, the price, etc.) including the pictures.

The Sales service makes a _transaction_ in which two actions take place:
- The upload of the pictures to the S3 Bucket
- The DB storing of the links that lead to the previously uploaded images

### The Catalogue service
The image above describes the flow after the api call has been done, so once the user has had access to the catalogue’s page, in order to populate the catalogue the app makes an api call to the Catalogue service.

1. The service retrieves the insertions from the DB.
2. The insertions retrived are then sent to the client
3. Each insertion data has the link to the images, so the client is responsible for their retrieval

By doing so, the catalogue service is not in charge of the image retrieval. This makes its job a lot lighter.

<div align="center">
<img src="https://user-images.githubusercontent.com/71827432/181816590-7e3279e2-958c-44e3-810a-fa37bd933050.png" width="400">
</div>

# Tests
In my case the system is a web app in which each request has the same amount of work, so it would make less sense to use the CPU or Memory usage as a metric for the autoscale, for this reasons I selected the _requestContPerTarget_ metric.

The tests are splitted into the following parts:
- Preliminary tests
- Scalability tests
The tool used was __JMetric__

## Preliminary tests
The goal of this phase was to stress a single instance of each service in order to find a threshold that, if overstepped, the instace reaches its critical capacity. This entails:
- The missed response of the server’s instance
- The substantial increase of the average response time It is just around this threshold that the autoscaling acts.

## Scalability tests
In this second phase the goal was to find out, for each service, the right values A and B such that:
- If 𝑟𝑒𝑞𝑢𝑒𝑠𝑡𝐶𝑜𝑛𝑡𝑃𝑒𝑟𝑇𝑎𝑟𝑔𝑒𝑡 ≥ 𝐵 , the service scales out
- If 𝑟𝑒𝑞𝑢𝑒𝑠𝑡𝐶𝑜𝑛𝑡𝑃𝑒𝑟𝑇𝑎𝑟𝑔𝑒𝑡 ≤ 𝐴 , the service scales in
I set B by picking values from the range 66%-70% of the critical threshold and set A to around the 29%-33% of the critical threshold, changing the workload each time. I followed the schema WU, RU_1, RU_2, S, RD_1, RD_2, RD_3; the below graph illustrates the workload pace

<div align="center">
<img src="https://user-images.githubusercontent.com/71827432/181819265-ccd5bad8-0ffd-4416-92e0-7f23083aa67f.png" width="600">
</div>
