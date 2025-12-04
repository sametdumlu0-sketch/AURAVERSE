
import { Brand, Product, Coupon, Campaign, User, Order, Comment, GlobalComment, UserDesign } from '../types';
import { INITIAL_BRANDS } from '../constants';

// Declare alasql as it is loaded via CDN script
declare var alasql: any;

// Utility for Basic XSS Sanitization
const sanitizeInput = (str: string): string => {
  if (!str) return '';
  return str.replace(/[<>]/g, ''); // Simple tag stripping
};

export const sqlService = {
  // Initialize Tables and Seed Data
  initDatabase: () => {
    // 1. Create Tables
    alasql(`
      CREATE TABLE IF NOT EXISTS Brands (
        id STRING PRIMARY KEY,
        name STRING,
        color STRING,
        description STRING,
        positionX NUMBER,
        positionY NUMBER,
        positionZ NUMBER,
        wallColor STRING,
        floorColor STRING,
        lightIntensity NUMBER
      )
    `);

    alasql(`
      CREATE TABLE IF NOT EXISTS Products (
        id STRING PRIMARY KEY,
        brandId STRING,
        name STRING,
        price NUMBER,
        stock NUMBER,
        description STRING,
        color STRING,
        category STRING,
        geometry STRING,
        imageUrl STRING,
        modelUrl STRING
      )
    `);

    alasql(`
      CREATE TABLE IF NOT EXISTS Coupons (
        id STRING PRIMARY KEY,
        brandId STRING,
        code STRING,
        discountPercentage NUMBER
      )
    `);

    alasql(`
      CREATE TABLE IF NOT EXISTS Campaigns (
        id STRING PRIMARY KEY,
        brandId STRING,
        name STRING,
        description STRING,
        active BOOLEAN
      )
    `);

    alasql(`
      CREATE TABLE IF NOT EXISTS Users (
        id STRING PRIMARY KEY,
        username STRING,
        email STRING,
        password STRING,
        tokens NUMBER,
        cash NUMBER,
        verEmail BOOLEAN,
        verPhone BOOLEAN,
        verId BOOLEAN,
        avatarUrl STRING
      )
    `);

    alasql(`
      CREATE TABLE IF NOT EXISTS Orders (
        id STRING PRIMARY KEY,
        userId STRING,
        orderDate STRING,
        orderTotal NUMBER,
        itemsJson STRING
      )
    `);

    alasql(`
      CREATE TABLE IF NOT EXISTS Comments (
        id STRING PRIMARY KEY,
        brandId STRING,
        userId STRING,
        username STRING,
        text STRING,
        timestamp STRING,
        avatarUrl STRING
      )
    `);

    alasql(`
      CREATE TABLE IF NOT EXISTS GlobalComments (
        id STRING PRIMARY KEY,
        userId STRING,
        username STRING,
        text STRING,
        timestamp STRING,
        avatarUrl STRING
      )
    `);

    // NEW: Table for User Designs (Creator Economy)
    alasql(`
      CREATE TABLE IF NOT EXISTS UserDesigns (
        id STRING PRIMARY KEY,
        userId STRING,
        username STRING,
        name STRING,
        description STRING,
        price NUMBER,
        configJson STRING,
        status STRING,
        createdDate STRING
      )
    `);

    // 2. Check if data exists, if not, SEED initial data
    const existingBrands = alasql("SELECT * FROM Brands");
    if (existingBrands.length === 0) {
      console.log("SQL: Initializing Database with Seed Data...");
      
      INITIAL_BRANDS.forEach(brand => {
        alasql(`INSERT INTO Brands VALUES (?,?,?,?,?,?,?,?,?,?)`, [
          brand.id, 
          brand.name, 
          brand.color, 
          brand.description,
          brand.position[0],
          brand.position[1],
          brand.position[2],
          '#111111', 
          '#222222', 
          1.0        
        ]);

        brand.products.forEach(p => {
          alasql(`INSERT INTO Products VALUES (?,?,?,?,?,?,?,?,?,?,?)`, [
            p.id,
            brand.id,
            p.name,
            p.price,
            p.stock || 10,
            p.description,
            p.color,
            p.category,
            p.geometry,
            p.imageUrl || '',
            p.modelUrl || ''
          ]);
        });

        brand.coupons?.forEach(c => {
          alasql(`INSERT INTO Coupons VALUES (?,?,?,?)`, [c.id, brand.id, c.code, c.discountPercentage]);
        });
        
        brand.campaigns?.forEach(c => {
          alasql(`INSERT INTO Campaigns VALUES (?,?,?,?,?)`, [c.id, brand.id, c.name, c.description, c.active]);
        });
      });
      console.log("SQL: Database Seeded.");
    }
  },

  getAllBrands: (): Brand[] => {
    const brandsDb = alasql("SELECT * FROM Brands");
    
    return brandsDb.map((b: any) => {
      const products = alasql("SELECT * FROM Products WHERE brandId = ?", [b.id]);
      const coupons = alasql("SELECT * FROM Coupons WHERE brandId = ?", [b.id]);
      const campaigns = alasql("SELECT * FROM Campaigns WHERE brandId = ?", [b.id]);

      return {
        id: b.id,
        name: b.name,
        color: b.color,
        description: b.description,
        position: [b.positionX, b.positionY, b.positionZ],
        podConfig: {
          wallColor: b.wallColor || '#111111',
          floorColor: b.floorColor || '#222222',
          lightIntensity: b.lightIntensity || 1
        },
        products: products.map((p: any) => ({
           ...p,
           imageUrl: p.imageUrl || undefined,
           modelUrl: p.modelUrl || undefined
        })),
        coupons: coupons,
        campaigns: campaigns
      } as Brand;
    });
  },

  addProduct: (brandId: string, product: Product) => {
    const brand = alasql("SELECT id FROM Brands WHERE id = ?", [brandId]);
    if (!brand.length) return false;

    alasql(`INSERT INTO Products VALUES (?,?,?,?,?,?,?,?,?,?,?)`, [
      product.id, brandId, sanitizeInput(product.name), product.price, product.stock,
      sanitizeInput(product.description), product.color, product.category, product.geometry,
      product.imageUrl || '', product.modelUrl || ''
    ]);
    return true;
  },

  addCoupon: (brandId: string, coupon: Coupon) => {
    const brand = alasql("SELECT id FROM Brands WHERE id = ?", [brandId]);
    if (!brand.length) return false;

    alasql(`INSERT INTO Coupons VALUES (?,?,?,?)`, [coupon.id, brandId, sanitizeInput(coupon.code), coupon.discountPercentage]);
  },

  addCampaign: (brandId: string, campaign: Campaign) => {
    const brand = alasql("SELECT id FROM Brands WHERE id = ?", [brandId]);
    if (!brand.length) return false;

    alasql(`INSERT INTO Campaigns VALUES (?,?,?,?,?)`, [campaign.id, brandId, sanitizeInput(campaign.name), sanitizeInput(campaign.description), campaign.active]);
  },
  
  updateBrandDesign: (brandId: string, wallColor: string, floorColor: string, intensity: number) => {
    alasql("UPDATE Brands SET wallColor = ?, floorColor = ?, lightIntensity = ? WHERE id = ?", [wallColor, floorColor, intensity, brandId]);
  },

  registerUser: (user: User): boolean => {
      const existing = alasql("SELECT * FROM Users WHERE email = ?", [user.email]);
      if (existing.length > 0) return false;

      alasql("INSERT INTO Users VALUES (?,?,?,?,?,?,?,?,?,?)", [
          user.id, sanitizeInput(user.username), user.email, user.password,
          user.tokens, user.cash || 5000,
          false, false, false, ''
      ]);
      return true;
  },

  loginUser: (email: string, pass: string): User | null => {
      const res = alasql("SELECT * FROM Users WHERE email = ? AND password = ?", [email, pass]);
      if (res.length > 0) {
          return sqlService.getUserById(res[0].id);
      }
      return null;
  },

  getUserById: (id: string): User | null => {
    const res = alasql("SELECT * FROM Users WHERE id = ?", [id]);
    if (res.length > 0) {
        const u = res[0];
        const ordersRaw = alasql("SELECT * FROM Orders WHERE userId = ?", [u.id]);
        const orders: Order[] = ordersRaw.map((o: any) => ({
            id: o.id,
            date: o.orderDate,
            total: o.orderTotal,
            items: JSON.parse(o.itemsJson)
        }));

        return {
            id: u.id, username: u.username, email: u.email, tokens: u.tokens,
            cash: u.cash || 0, cart: [], avatarUrl: u.avatarUrl, orders: orders,
            verification: { isEmailVerified: !!u.verEmail, isPhoneVerified: !!u.verPhone, isIdVerified: !!u.verId }
        };
    }
    return null;
  },

  updateVerification: (userId: string, type: 'EMAIL' | 'PHONE' | 'ID') => {
      if (type === 'EMAIL') alasql("UPDATE Users SET verEmail = TRUE WHERE id = ?", [userId]);
      if (type === 'PHONE') alasql("UPDATE Users SET verPhone = TRUE WHERE id = ?", [userId]);
      if (type === 'ID')    alasql("UPDATE Users SET verId = TRUE WHERE id = ?", [userId]);
  },

  updateUserAvatar: (userId: string, avatarUrl: string) => {
      const cleanUrl = sanitizeInput(avatarUrl);
      alasql("UPDATE Users SET avatarUrl = ? WHERE id = ?", [cleanUrl, userId]);
  },

  addTokenReward: (userId: string, amount: number) => {
      alasql("UPDATE Users SET tokens = tokens + ? WHERE id = ?", [amount, userId]);
  },

  depositFunds: (userId: string, amount: number, type: 'CASH' | 'TOKEN'): { success: boolean, msg: string } => {
      if (amount <= 0) return { success: false, msg: "Geçersiz tutar." };
      if (type === 'CASH') {
          alasql("UPDATE Users SET cash = cash + ? WHERE id = ?", [amount, userId]);
          return { success: true, msg: `$${amount} Nakit hesaba yüklendi.` };
      } else {
          alasql("UPDATE Users SET tokens = tokens + ? WHERE id = ?", [amount, userId]);
          return { success: true, msg: `${amount} Token hesaba yüklendi.` };
      }
  },

  transferFunds: (senderId: string, receiverUsername: string, amount: number, type: 'CASH' | 'TOKEN'): { success: boolean, msg: string } => {
    const sender = alasql("SELECT * FROM Users WHERE id = ?", [senderId])[0];
    const receiver = alasql("SELECT * FROM Users WHERE username = ?", [sanitizeInput(receiverUsername)])[0];
    
    if (!sender) return { success: false, msg: "Gönderici bulunamadı." };
    if (!receiver) return { success: false, msg: "Alıcı kullanıcı bulunamadı." };
    if (receiver.id === senderId) return { success: false, msg: "Kendinize transfer yapamazsınız." };

    if (type === 'TOKEN') {
        if (sender.tokens < amount) return { success: false, msg: "Yetersiz Token bakiyesi." };
        alasql("UPDATE Users SET tokens = tokens - ? WHERE id = ?", [amount, senderId]);
        alasql("UPDATE Users SET tokens = tokens + ? WHERE id = ?", [amount, receiver.id]);
    } else {
        if ((sender.cash || 0) < amount) return { success: false, msg: "Yetersiz Nakit bakiyesi." };
        alasql("UPDATE Users SET cash = cash - ? WHERE id = ?", [amount, senderId]);
        alasql("UPDATE Users SET cash = cash + ? WHERE id = ?", [amount, receiver.id]);
    }
    return { success: true, msg: "Transfer başarıyla gerçekleşti." };
  },

  convertCashToTokens: (userId: string, cashAmount: number): { success: boolean, msg: string } => {
    const user = alasql("SELECT * FROM Users WHERE id = ?", [userId])[0];
    if (!user) return { success: false, msg: "Kullanıcı hatası." };
    if ((user.cash || 0) < cashAmount) return { success: false, msg: "Yetersiz Nakit." };

    const tokenAmount = cashAmount * 10;
    alasql("UPDATE Users SET cash = cash - ? WHERE id = ?", [cashAmount, userId]);
    alasql("UPDATE Users SET tokens = tokens + ? WHERE id = ?", [tokenAmount, userId]);

    return { success: true, msg: `${cashAmount} Nakit, ${tokenAmount} Token'a çevrildi.` };
  },

  createOrder: (userId: string, cart: Product[], total: number) => {
      alasql("UPDATE Users SET tokens = tokens - ? WHERE id = ?", [total, userId]);
      cart.forEach(item => {
          alasql("UPDATE Products SET stock = stock - 1 WHERE id = ? AND stock > 0", [item.id]);
      });
      const orderId = `ord-${Date.now()}`;
      const itemsJson = JSON.stringify(cart);
      const date = new Date().toLocaleString('tr-TR');
      alasql("INSERT INTO Orders VALUES (?,?,?,?,?)", [orderId, userId, date, total, itemsJson]);
  },

  getCommentsForBrand: (brandId: string): Comment[] => {
    return alasql("SELECT * FROM Comments WHERE brandId = ?", [brandId]);
  },

  addComment: (brandId: string, userId: string, username: string, text: string, avatarUrl: string) => {
    const id = `cmt-${Date.now()}`;
    const timestamp = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    const safeText = sanitizeInput(text);
    alasql("INSERT INTO Comments VALUES (?,?,?,?,?,?,?)", [id, brandId, userId, username, safeText, timestamp, avatarUrl]);
  },

  getAllRecentOrders: () => {
    const res = alasql(`
        SELECT Orders.id, Users.username, Users.avatarUrl, Orders.itemsJson, Orders.orderTotal, Orders.orderDate 
        FROM Orders 
        JOIN Users ON Orders.userId = Users.id 
        ORDER BY Orders.id DESC 
        LIMIT 20
    `);
    
    return res.map((r: any) => ({
        ...r,
        items: JSON.parse(r.itemsJson)
    }));
  },

  getGlobalComments: (): GlobalComment[] => {
      return alasql("SELECT * FROM GlobalComments ORDER BY id DESC LIMIT 50");
  },

  addGlobalComment: (userId: string, username: string, text: string, avatarUrl: string) => {
      const id = `gcmt-${Date.now()}`;
      const timestamp = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
      const safeText = sanitizeInput(text);
      alasql("INSERT INTO GlobalComments VALUES (?,?,?,?,?,?)", [id, userId, username, safeText, timestamp, avatarUrl]);
  },

  // --- CREATOR ECONOMY METHODS ---
  publishDesign: (userId: string, username: string, name: string, description: string, price: number, config: any) => {
      const id = `dsgn-${Date.now()}`;
      const configJson = JSON.stringify(config);
      const createdDate = new Date().toLocaleDateString('tr-TR');
      alasql("INSERT INTO UserDesigns VALUES (?,?,?,?,?,?,?,?,?)", 
        [id, userId, username, sanitizeInput(name), sanitizeInput(description), price, configJson, 'FOR_SALE', createdDate]);
  },

  getDesignsForSale: (): UserDesign[] => {
      const res = alasql("SELECT * FROM UserDesigns WHERE status = 'FOR_SALE'");
      return res.map((d: any) => ({
          ...d,
          config: JSON.parse(d.configJson)
      }));
  },

  buyDesignAsBrand: (brandId: string, designId: string): { success: boolean, msg: string } => {
      const design = alasql("SELECT * FROM UserDesigns WHERE id = ?", [designId])[0];
      if (!design) return { success: false, msg: "Tasarım bulunamadı." };
      
      const parsedConfig = JSON.parse(design.configJson);

      // 1. Pay the Creator (Simulated: Transfer tokens from System to User)
      alasql("UPDATE Users SET tokens = tokens + ? WHERE id = ?", [design.price, design.userId]);

      // 2. Add as a real Product to the Brand
      const newProduct: Product = {
          id: `prod-${designId}`,
          // brandId removed to fix type error
          name: design.name,
          price: Math.floor(design.price * 1.2), // Brand marks up price
          stock: 50,
          description: `Designer: ${design.username}. ${design.description}`,
          color: parsedConfig.baseColor,
          category: 'Community Design',
          geometry: parsedConfig.geometry,
          imageUrl: '',
          modelUrl: ''
      };
      
      const added = sqlService.addProduct(brandId, newProduct);
      if(added) {
          // 3. Mark design as SOLD
          alasql("UPDATE UserDesigns SET status = 'SOLD' WHERE id = ?", [designId]);
          return { success: true, msg: "Tasarım satın alındı ve envantere eklendi!" };
      }
      return { success: false, msg: "Envanter hatası." };
  }
};
