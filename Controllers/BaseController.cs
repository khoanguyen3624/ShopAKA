using System.Linq;
using System.Web.Mvc;
using ShopAKA.Models;

namespace ShopAKA.Controllers
{
    public class BaseController : Controller
    {
        protected MyShopEntities db = new MyShopEntities();

        protected override void OnActionExecuting(ActionExecutingContext filterContext)
        {
            ViewBag.Categories = db.Category.OrderBy(c => c.CategoryID).ToList();
            base.OnActionExecuting(filterContext);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }
    }
}

