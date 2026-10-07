
const http = require("http");

http.get("http://127.0.0.1:8000/api/products", (res) => {
  let data = "";
  res.on("data", (c) => data += c);
  res.on("end", () => {
    const allProds = JSON.parse(data).data || [];
    
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

      if (targetSlug === "diwali-gifts" || targetLower === "diwali gifts") {
        return pSlug === "diwali-gifts" || pName.includes("diwali") || pTitle.includes("diwali") || pTitle.includes("diya") || pTitle.includes("light") || pTitle.includes("candle") || pTitle.includes("lamp") || pTitle.includes("luminary") || pTitle.includes("votive") || pTitle.includes("utsav") || pTitle.includes("rangoli") || pTitle.includes("brass") || pDesc.includes("diwali");
      }
      
      if (targetSlug === "anniversary-gifts" || targetLower === "anniversary gifts") {
        return pSlug === "anniversary-gifts" || pName.includes("anniversary") || pTitle.includes("anniversary") || pTitle.includes("casket") || pTitle.includes("signature hamper") || pDesc.includes("anniversary");
      }

      return false;
    };
    
    let listDiwali = allProds.filter(p => {
      let matchesRoute = checkProductMatchesCategory(p, "diwali-gifts"); 
      if (!matchesRoute) return false;
      if (p.name.toLowerCase().includes("birthday") || p.name.toLowerCase().includes("anniversary")) return false;
      return true;
    });

    let listAnniv = allProds.filter(p => {
      let matchesRoute = checkProductMatchesCategory(p, "anniversary-gifts"); 
      if (!matchesRoute) return false;
      if (p.name.toLowerCase().includes("diwali") || p.name.toLowerCase().includes("birthday")) return false;
      return true;
    });
    
    console.log("Diwali:", listDiwali.length);
    console.log("Anniversary:", listAnniv.length);
  });
});

