using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Linq;
using System.Net;
using System.Web;
using System.Web.Mvc;
using ShopAKA.Models;

namespace ShopAKA.Controllers
{
    public class UsersController : Controller
    {
        private MyShopEntities db = new MyShopEntities();

        // GET: Users
        public ActionResult Index()
        {
            var adminUsers = db.User.Where(u => u.UserRole == "1").ToList();
            return View(adminUsers);
        }

        // GET: Users/Create
        public ActionResult Create()
        {
            return View();
        }

        // POST: Users/Create
        // To protect from overposting attacks, enable the specific properties you want to bind to, for 
        // more details see https://go.microsoft.com/fwlink/?LinkId=317598.
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Create([Bind(Include = "Username,Password,UserRole")] User user)
        {
            if (ModelState.IsValid)
            {
                var existingUser = db.User.FirstOrDefault(u => u.Username == user.Username);
                if (existingUser != null)
                {
                    ModelState.AddModelError("Username", "Tên đăng nhập đã tồn tại");
                    return View(user);
                }

                user.UserRole = "1";

                db.User.Add(user);
                db.SaveChanges();
                return RedirectToAction("Index");
            }

            user.UserRole = "1";
            return View(user);
        }

        // GET: Users/Edit/5
        public ActionResult Edit(string id)
        {
            if (id == null)
            {
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
            }
            User user = db.User.Find(id);
            if (user == null)
            {
                return HttpNotFound();
            }

            if (user.UserRole != "1")
            {
                return new HttpStatusCodeResult(HttpStatusCode.Forbidden, "Chỉ có thể chỉnh sửa tài khoản quản trị");
            }

            return View(user);
        }

        // POST: Users/Edit/5
        // To protect from overposting attacks, enable the specific properties you want to bind to, for 
        // more details see https://go.microsoft.com/fwlink/?LinkId=317598.
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Edit([Bind(Include = "Username,Password,UserRole")] User user)
        {
            if (ModelState.IsValid)
            {
                var existingUser = db.User.Find(user.Username);
                if (existingUser == null)
                {
                    return HttpNotFound();
                }

                if (existingUser.UserRole != "1")
                {
                    return new HttpStatusCodeResult(HttpStatusCode.Forbidden, "Chỉ có thể chỉnh sửa tài khoản quản trị");
                }

                existingUser.Password = user.Password;
                existingUser.UserRole = "1";

                db.Entry(existingUser).State = System.Data.Entity.EntityState.Modified;
                db.SaveChanges();
                return RedirectToAction("Index");
            }

            user.UserRole = "1";
            return View(user);
        }

        // GET: Users/Delete/5
        public ActionResult Delete(string id)
        {
            if (id == null)
            {
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
            }
            User user = db.User.Include(u => u.Customer).FirstOrDefault(u => u.Username == id);
            if (user == null)
            {
                return HttpNotFound();
            }

            if (user.UserRole != "1")
            {
                return new HttpStatusCodeResult(HttpStatusCode.Forbidden, "Chỉ có thể xóa tài khoản quản trị");
            }

            ViewBag.HasRelatedCustomers = user.Customer != null && user.Customer.Count > 0;
            ViewBag.CustomerCount = user.Customer != null ? user.Customer.Count : 0;

            return View(user);
        }

        // POST: Users/Delete/5
        [HttpPost, ActionName("Delete")]
        [ValidateAntiForgeryToken]
        public ActionResult DeleteConfirmed(string id)
        {
            User user = db.User.Include(u => u.Customer).FirstOrDefault(u => u.Username == id);
            if (user == null)
            {
                return HttpNotFound();
            }

            if (user.UserRole != "1")
            {
                return new HttpStatusCodeResult(HttpStatusCode.Forbidden, "Chỉ có thể xóa tài khoản quản trị");
            }

            if (user.Customer != null && user.Customer.Count > 0)
            {
                return Content("<script>alert('Không thể xóa tài khoản này vì có khách hàng liên quan. Số lượng khách hàng: " + user.Customer.Count + "'); window.location.href='" + Url.Action("Index", "Users") + "';</script>");
            }

            db.User.Remove(user);
            db.SaveChanges();
            return RedirectToAction("Index");
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
