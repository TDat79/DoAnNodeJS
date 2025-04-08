const Menu = require('../models/Menu');

class MenuController {
  // CREATE: Thêm mới menu
  static async createMenu(req, res) {
    try {
      const { text, url, parent } = req.body;
      const newMenu = new Menu({ text, url, parent });
      const savedMenu = await newMenu.save();
      res.status(201).json(savedMenu);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // READ: Lấy tất cả menu theo cấu trúc cha con
  static async getAllMenus(req, res) {
    try {
      // Lấy tất cả menu từ database
      const menus = await Menu.find().populate('parent'); // Populate để lấy thông tin parent

      // Xây dựng cây menu (danh sách cha con)
      const menuTree = [];
      const menuMap = new Map();

      // Tạo map để lưu tất cả menu với id làm key
      menus.forEach(menu => {
        menuMap.set(menu._id.toString(), { ...menu._doc, children: [] });
      });

      // Xây dựng cây
      menus.forEach(menu => {
        const menuObj = menuMap.get(menu._id.toString());
        if (menu.parent) {
          // Nếu có parent, thêm vào children của parent
          const parentObj = menuMap.get(menu.parent._id.toString());
          if (parentObj) {
            parentObj.children.push(menuObj);
          }
        } else {
          // Nếu không có parent, đây là menu cấp cao nhất
          menuTree.push(menuObj);
        }
      });

      res.json(menuTree);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // UPDATE: Cập nhật menu
  static async updateMenu(req, res) {
    try {
      const { id } = req.params;
      const { text, url, parent } = req.body;
      const updatedMenu = await Menu.findByIdAndUpdate(
        id,
        { text, url, parent },
        { new: true, runValidators: true }
      );
      if (!updatedMenu) {
        return res.status(404).json({ message: 'Menu not found' });
      }
      res.json(updatedMenu);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // DELETE: Xóa menu
  static async deleteMenu(req, res) {
    try {
      const { id } = req.params;
      const deletedMenu = await Menu.findByIdAndDelete(id);
      if (!deletedMenu) {
        return res.status(404).json({ message: 'Menu not found' });
      }
      res.json({ message: 'Menu deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = MenuController;