# **Address Insights Webpage Interview Challenge**

## **Deliverables & Submission**

* **GitHub Repository** with all code   
* **Very short README** including:  
  * The **public URL with the live app** deployed on Vercel.  
  * Description of what  you *personally* built vs what AI assistants generated.  
  * Your approach to solving the problem.  
  * Any assumptions or design decisions made.

Upon completion, POST the git repo to the endpoint [https://app.rentengine.io/api/public/v1/careers/interview/submit](https://app.rentengine.io/api/public/v1/careers/interview/submit)  with a JSON body containing the fields *project\_github\_url* and *candidate\_name.* 

---

## **Project Brief**

The goal is to build an end-to-end project and host it live. Create a simple website where a user types in a street address and receives an **insights** page for the selected address. You can start with any repo. The implementation should be secure, tested and as production ready given the time constraint. We encourage you to use all your favorite tools, including AI, but be prepared to discuss and justify all implementation details. 

### **Desired features**

1. **Walking Score** \- your own simple metric based on nearby amenities/businesses (this info is available in geocoding services listed below)  
2. **Driving Score** \- similar metric, but assume greater radius/amenity reach.  
3. **Urban/Suburban Index** \- a single number or label inferred from the density/type of amenities.  
4. **Search History** \- show recent address lookups stored locally (in the browser or device).  
5. **Render Map** \- render the address on a map with nearby amenities highlighted.  
6. **Shareable Page** \- When you send the URL to a friend, they should see the same thing as you  
7. **Any other interesting features you might think of**

---

## **Data & APIs**

It’s important to us that the data used is real, however the source of the data is less important:

* Use any free/open geocoding and map APIs you prefer (ex: free tier of Mapbox, Google Places API or LocationIQ).  
* Don’t worry about “perfect math” for the indices:  
  * Use simple heuristics (e.g., count amenities in a radius).  
  * The goal is to show reasoning, not produce authoritative scores.

---

## **UI & UX**

* Should be:  
  * **Usable and clear.**  
  * **Styled enough** that you’d feel comfortable showing it off.  
* You can use any design component framework that you’re comfortable with. We currently use MUI internally but it’s not important for this project

---

## **Time Budget**

* Aim for **1-3 hours** of effort. It’s ok if you don’t complete every last feature within the time frame.  
* Focus on a working version that takes you from address input to insights page

---

**Tip:** Don’t let perfect be the enemy of good. Don’t over-engineer the math. Keep the calculations simple but methodical, then explain *why* you chose that approach. The evaluation is more about your thinking, coding, and communication than about a “true” walking score.

