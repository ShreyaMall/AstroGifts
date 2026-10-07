
const http = require("http");

http.get("http://127.0.0.1:8000/api/products", (res) => {
  let data = "";
  res.on("data", (c) => data += c);
  res.on("end", () => {
    const allProds = JSON.parse(data).data || [];
    
    // Paste logic here
    const checkProductMatchesCategory = (p, target) => {
      if (!p || !target) return false;
      const targetLower = target.toLowerCase().trim();
      const targetSlug = targetLower.replace(/_/g, "-").replace(/[^a-z0-9-]+/g, "");

      const pSlug  = (p.category_slug || "").toLowerCase().trim();
      const pName  = (p.category_name || p.category || "").toLowerCase().trim();
      const pTitle = (p.name || "").toLowerCase().trim();
      const pDesc  = (p.description || "").toLowerCase().trim();

      if (pSlug === targetSlug || pSlug === targetLower || pName === targetLower || pName === targetSlug) {
        return true;
      }
      
      if (targetSlug === "gifts" || targetLower === "gifts") {
        return pSlug === "gifts" || pSlug === "diwali-gifts" || pSlug === "birthday-gifts" || pSlug === "anniversary-gifts" ||
               pName.includes("gift") || pTitle.includes("gift") || pTitle.includes("hamper") || pTitle.includes("luminary") || pTitle.includes("votive") || pTitle.includes("casket") || pTitle.includes("balloon") || pTitle.includes("smartots");
      }
      
      if (targetSlug === "birthday-gifts" || targetLower === "birthday gifts") {
        return pSlug === "birthday-gifts" || pName.includes("birthday") || pTitle.includes("birthday") || pTitle.includes("bday") || pTitle.includes("balloon");
      }
      return false;
    };
    
    const activeSlug = "birthday-gifts";
    const appliedPriceMin = 0;
    const appliedPriceMax = 10000;
    const selectedCategories = [];
    
    let list = allProds.filter(p => {
      if (p.price < appliedPriceMin) return false;
      if (p.price > appliedPriceMax) return false;

      let matchesRoute = checkProductMatchesCategory(p, activeSlug); 
      if (!matchesRoute) return false;

      if (activeSlug === "birthday-gifts") {
        if (p.name.toLowerCase().includes("diwali")) return false;
      }
      return true;
    });
    
    console.log("Filtered length:", list.length);
    console.log(list.map(p => p.name));
  });
});

