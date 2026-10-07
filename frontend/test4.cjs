
const http = require("http");
const fs = require("fs");
const code = fs.readFileSync("frontend/src/pages/CategoryPage.jsx", "utf8");
let matchesFnStr = code.substring(code.indexOf("  const checkProductMatchesCategory ="));
matchesFnStr = matchesFnStr.substring(0, matchesFnStr.indexOf("  const filtered ="));
http.get("http://127.0.0.1:8000/api/products", (res) => {
  let data = "";
  res.on("data", (c) => data += c);
  res.on("end", () => {
    const allProds = JSON.parse(data).data || [];
    eval(matchesFnStr);
    
    // Also include the exclusion guards just to be safe
    const getFiltered = (activeSlug) => {
      return allProds.filter(p => {
        let matchesRoute = checkProductMatchesCategory(p, activeSlug);
        if (!matchesRoute) return false;
        
        const pTitle = (p.name || "").toLowerCase().trim();
        const pSlug = (p.category_slug || "").toLowerCase().trim();
        
        if (activeSlug === "anniversary-gifts") {
          if (pTitle.includes("diwali") || pTitle.includes("diya") || pTitle.includes("pooja") || pTitle.includes("puja") || 
              pTitle.includes("birthday") || pTitle.includes("bday") || pTitle.includes("baby")) {
            return false;
          }
        } else if (activeSlug === "birthday-gifts") {
          if (pTitle.includes("diwali") || pTitle.includes("diya") || pTitle.includes("pooja") || pTitle.includes("puja") || 
              pTitle.includes("anniversary") || pTitle.includes("couple frame")) {
            return false;
          }
        } else if (activeSlug === "diwali-gifts") {
          if (pTitle.includes("birthday") || pTitle.includes("bday") || pTitle.includes("anniversary") || pTitle.includes("baby")) {
            return false;
          }
        }
        return true;
      });
    };

    console.log("Diwali:", getFiltered("diwali-gifts").length);
    console.log("Anniv:", getFiltered("anniversary-gifts").length);
    console.log("Bday:", getFiltered("birthday-gifts").length);
  });
});

