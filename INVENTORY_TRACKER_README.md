# Med Spa Inventory Tracker

A comprehensive inventory management system built for medical spas to track botox, filler, and other aesthetic products.

## Features

### 📊 Dashboard
- **Real-time Analytics**: View total products, inventory value, low stock alerts, and expired items
- **Visual Charts**: 
  - Top products by value (bar chart)
  - Units distribution by product type (pie chart)
- **30-day Usage Tracking**: Monitor recent product usage

### 📦 Product Management
- **Add/Edit Products**: Full product form with validation
- **Product Types**: Botox, Filler, and Other
- **Botox Variants**: Botox, Dysport, Jeuveau, Xeomin
- **Filler Types**: Hyaluronic Acid, Radiesse, Sculptra, Bellafill, Other
- **Batch Tracking**: Monitor batch numbers and expiration dates
- **Supplier Information**: Track suppliers for each product
- **Cost Tracking**: Record cost per unit for inventory valuation

### 🔍 Product List & Search
- **Comprehensive List View**: See all products in a sortable table
- **Search**: Find products by name or supplier
- **Filters**: Filter by product type (All, Botox, Filler, Other)
- **Sorting Options**: Sort by Name, Quantity, Value, or Expiration Date
- **Status Indicators**: Visual alerts for:
  - 🔴 Expired items (red)
  - 🟡 Items expiring within 30 days (yellow)
  - 🟠 Low stock items (orange)
  - 🟢 Healthy stock (green)

### 📝 Activity Logging
- **Track Actions**: Log product usage, additions, adjustments, and removals
- **Detailed Records**: Include reason and notes for each action
- **Automatic Updates**: Quantity updates automatically based on logged actions
- **History**: Complete audit trail of all inventory changes

### 💾 Data Persistence
- **Local Storage**: All data is automatically saved to your browser's local storage
- **No Server Required**: Works completely offline

## Getting Started

### Access the Inventory Tracker
Navigate to `/inventory` in the application.

### Add Your First Product
1. Click the "Add Product" button in the header
2. Fill in product details:
   - Product name (required)
   - Type (Botox or Filler)
   - Variant/Filler Type
   - Current quantity
   - Reorder level (when to reorder)
   - Cost per unit
   - Supplier information
   - Batch number
   - Expiration date (optional)
   - Notes (optional)
3. Click "Add Product" to save

### Track Usage
For each product:
1. Click the product name or edit button to view details
2. In the Activity Log section, click "Log Activity"
3. Select the action type (Used, Added, Adjusted, Removed)
4. Enter the quantity and reason
5. Add any notes
6. Click "Log Activity" to record

### Monitor Inventory
- **Dashboard**: Get a quick overview of inventory health
- **Products View**: See detailed list with status indicators
- **Search**: Quickly find specific products
- **Alerts**: Pay attention to expiration and low stock warnings

## Product Types & Variants

### Botox Products
- Botox (Allergan)
- Dysport (Galderma)
- Jeuveau (Evolus)
- Xeomin (Merz)

### Filler Products
- Hyaluronic Acid (Juvederm, Restylane, etc.)
- Radiesse (Calcium Hydroxylapatite)
- Sculptra (Poly-L-Lactic Acid)
- Bellafill (Polymethylmethacrylate)
- Other

## Data Management

### Export Your Data
Your inventory data is stored in browser localStorage:
- Products: `med-spa-inventory-products`
- Activity Logs: `med-spa-inventory-logs`

### Backup Important Data
Regularly note your inventory quantities and export critical information for backup purposes.

## Tips & Best Practices

1. **Regular Updates**: Log usage immediately after procedures to maintain accurate inventory
2. **Reorder Levels**: Set reorder levels based on typical monthly usage
3. **Batch Tracking**: Always record batch numbers for traceability
4. **Expiration Dates**: Mark expiration dates for all temperature-sensitive products
5. **Supplier Notes**: Keep supplier contact info in notes for quick reordering
6. **Cost Tracking**: Update cost per unit when prices change
7. **Regular Audits**: Do physical counts monthly to verify digital records

## Technical Details

### Built With
- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Recharts for visualizations
- React Hook Form for validation
- Zod for schema validation

### Data Structure
Products and logs are stored as JSON in localStorage with the following schema:
- **Product ID**: Unique identifier (timestamp-based)
- **Quantity Tracking**: Automatic updates based on logged activities
- **Dates**: ISO format (YYYY-MM-DD)
- **Costs**: Stored as decimals for accurate calculations

### Browser Compatibility
Works on any modern browser with localStorage support:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## Troubleshooting

### Data Not Saving?
- Check if your browser has localStorage enabled
- Clear browser cache if you see stale data
- Ensure you have space available in browser storage

### Calculations Off?
- Verify that cost per unit is correctly entered
- Check that quantity updates are being logged
- Review activity log to see if changes were recorded

### Charts Not Showing?
- Add more products with different types
- Ensure products have valid quantity values
- Try refreshing the page

## Future Enhancements

Planned features:
- Database integration for multi-user access
- Email alerts for low stock and expiring products
- PDF reports and export functionality
- Multi-location inventory tracking
- Supplier cost history
- Usage analytics and trends
- Mobile app version
- Batch/lot traceability features

## Support

For issues or feature requests, please contact your development team.
