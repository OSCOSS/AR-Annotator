# ARAN
ARAN stands for Automatic Article and Review Annotator. 
The repositoy of ARAN includes:
  The source code, 
  Evaluation procedure,
  and a sample created article.      
  
  In the following comes detailed explanation of each folder:
  
  ## Sample Articles 
  
  It includes sample produced articles with ARAN. The specifically show the functionality of the framework in keeping reviews from the review workflow and annotation article sections with RDFa.     
  
  ## Article Section Classificaiton 
  ### Article URLS
  This folder includes a list of urls to articles in the are of computer science that have variety of layouts. We used these articles to create a knowledge base of common titles for different sections inside articles.
  
  ### AS_metadata
  This folder holdes the extracted section titles from the listed articles in "Article URLS" folder and their classification and mapping to different ontologies. 
  
  
  ## Evaluation
  ### Usability Evaluation
  This folder is the evaluation of using the system in the use case that the system is used to help authors to get a fast overview of the feedbacks given by reviewers after he/she has got the submission result.
  ### Evaluation usefulness for users
 This folder includes the questionare and procedure used in the related paper to evaluate the ease of consumption of attached reviews to articles. 
 ### Evaluation usefulness for machine clients
 This folder lists the proposed queries to evaluate usefullness of the semantic annotation of the articles done in the related paper.
  
  ## Source Code
  The source code that is reflected by the paper in available in the folder https://github.com/OSCOSS/ARAN/tree/master/SourceCode/htmlrdfa.

## An extension based on ARAN :
An extension for Fidus Writer is created based on the current code. The developed extension can be accessed in this github repository via https://github.com/fiduswriter. 
