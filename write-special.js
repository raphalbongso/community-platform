var fs=require("fs");var p=require("path");var LP=String.fromCharCode(40);var RP=String.fromCharCode(41);var b="C:/Users/rapha/community-platform/apps/";

var mainPage = "export default function FeedPage() {\n  return (\n    <main className=\"max-w-4xl mx-auto px-4 py-8\">\n      <h1 className=\"text-3xl font-bold mb-6\">Feed</h1>\n      <p className=\"text-gray-500\">Coming soon...</p>\n    </main>\n  );\n}";

var mainLayout = "export default function MainLayout({\n  children,\n}: {\n  children: React.ReactNode;\n}) {\n  return (\n    <div className=\"min-h-screen\">\n      <nav className=\"border-b border-gray-200 bg-white\">\n        <div className=\"max-w-7xl mx-auto px-4 h-16 flex items-center gap-8\">\n          <span className=\"text-xl font-bold text-primary-600\">Community</span>\n          <div className=\"flex gap-6 text-sm font-medium text-gray-600\">\n            <a href=\"/\" className=\"hover:text-gray-900\">Feed</a>\n            <a href=\"/discover\" className=\"hover:text-gray-900\">Discover</a>\n            <a href=\"/communities\" className=\"hover:text-gray-900\">Communities</a>\n            <a href=\"/profile\" className=\"hover:text-gray-900\">Profile</a>\n          </div>\n        </div>\n      </nav>\n      {children}\n      <footer className=\"border-t border-gray-200 bg-white mt-16\">\n        <div className=\"max-w-7xl mx-auto px-4 py-6 text-center text-xs text-gray-400\">\n          Support is voluntary and creator-defined. This platform does not offer investments or financial returns.\n        </div>\n      </footer>\n    </div>\n  );\n}";

var dashboardLayout = fs.readFileSync(b+"dashboard-web/dashboard-layout.txt","utf8");
var dashboardPage = fs.readFileSync(b+"dashboard-web/dashboard-page.txt","utf8");

var mainDir = b+"community-web/src/app/"+LP+"main"+RP+"/";
fs.writeFileSync(mainDir+"page.tsx", mainPage);
fs.writeFileSync(mainDir+"layout.tsx", mainLayout);
console.log("Written: community-web main page and layout");

var dashDir = b+"dashboard-web/src/app/"+LP+"dashboard"+RP+"/";
fs.writeFileSync(dashDir+"layout.tsx", dashboardLayout);
fs.writeFileSync(dashDir+"page.tsx", dashboardPage);
console.log("Written: dashboard-web dashboard layout and page");

