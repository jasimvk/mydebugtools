# MyDebugTools Theme Guide

## 🎨 Brand Colors

### Primary Orange
- **Main**: `#FF6C37` - Use for primary actions, active states, brand elements
- **Hover**: `#ff5722` - Hover state for orange buttons and links
- **Light**: `#FFF5F2` - Light backgrounds for orange-themed sections
- **Dark**: `#E85A27` - Darker variant for emphasis

### Usage in Tailwind
```tsx
// Background
className="bg-[#FF6C37]"
className="bg-primary"

// Hover
className="hover:bg-[#ff5722]"
className="hover:bg-primary-hover"

// Text
className="text-[#FF6C37]"
className="text-primary"
```

## 📝 Typography

### Font Family
- **Primary**: Inter (Google Font)
- **Fallback**: system-ui, -apple-system, sans-serif
- **Code/Mono**: Font Mono, Menlo, Monaco, Courier New

### Font Sizes
```tsx
// Headings
h1: text-3xl font-bold
h2: text-2xl font-semibold
h3: text-xl font-semibold

// Body
base: text-base (16px)
small: text-sm (14px)
xs: text-xs (12px)
```

## 🎯 Component Styles

### Buttons

#### Primary Button
```tsx
className="px-4 py-2 bg-[#FF6C37] hover:bg-[#ff5722] text-white font-medium rounded-lg transition-colors"
// Or use utility class:
className="btn-primary"
```

#### Secondary Button
```tsx
className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-lg border border-gray-300 transition-colors"
// Or use utility class:
className="btn-secondary"
```

### Cards
```tsx
className="bg-white border border-gray-200 rounded-lg shadow-sm"
// Or use utility class:
className="card"
```

### Input Fields
```tsx
className="border-gray-300 rounded-md focus:ring-2 focus:ring-[#FF6C37] focus:border-transparent"
```

### Tabs (Postman Style)
```tsx
// Active tab
className="px-4 py-3 text-sm font-medium text-[#FF6C37] relative"

// Tab underline
<div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF6C37]"></div>

// Inactive tab
className="px-4 py-3 text-sm font-medium text-gray-600 hover:text-gray-900"
```

## 🌈 Color Palette

### Grays
- **bg-gray-50**: `#fafafa` - Page backgrounds
- **bg-gray-100**: `#f5f5f5` - Card sections
- **bg-gray-200**: `#e5e7eb` - Borders
- **text-gray-600**: `#6b7280` - Secondary text
- **text-gray-900**: `#111827` - Primary text

### Status Colors
- **Success**: Green-500 `#22c55e`
- **Error**: Red-600 `#dc2626`
- **Warning**: Orange-500 `#f97316`
- **Info**: Blue-500 `#3b82f6`

## 📐 Spacing & Layout

### Max Width Containers
```tsx
// Standard content
className="max-w-7xl mx-auto"

// Wide content (API Tester)
className="max-w-[1600px] mx-auto"
```

### Padding
- **Section**: `px-6 py-6`
- **Card**: `p-6`
- **Card Header**: `p-4`
- **Small Elements**: `p-2` or `p-3`

### Borders
- **Standard**: `border border-gray-200`
- **Focus**: `focus:ring-2 focus:ring-[#FF6C37]`

## 🎭 Navigation Bar

```tsx
<nav className="bg-white border-b border-gray-200">
  <div className="max-w-7xl mx-auto px-6">
    <div className="flex items-center justify-between h-14">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2">
        <Terminal className="h-5 w-5 text-[#FF6C37]" />
        <span className="text-base font-semibold text-gray-900">MyDebugTools</span>
      </Link>
      
      {/* Nav items with active state */}
      <Link
        href="/tools"
        className={active 
          ? 'bg-[#FF6C37] text-white' 
          : 'text-gray-700 hover:bg-gray-100'
        }
      >
        Tool Name
      </Link>
    </div>
  </div>
</nav>
```

## ✨ Best Practices

1. **Consistency**: Always use `#FF6C37` for primary brand color
2. **Hover States**: Use `#ff5722` for hover effects
3. **Transitions**: Add `transition-colors` to interactive elements
4. **Font**: Use Inter font family throughout
5. **Spacing**: Use Tailwind's spacing scale (p-4, p-6, etc.)
6. **Borders**: Stick to `border-gray-200` for consistency
7. **Shadows**: Use `shadow-sm` for subtle depth
8. **Rounded Corners**: Use `rounded-lg` or `rounded-md` consistently

## 🖥️ API Tester Specific

The API Tester uses Postman-inspired design:
- Clean white cards with subtle shadows
- Orange accent (#FF6C37) for active tabs
- Thin orange underline for active tabs (h-0.5)
- Grid-based table layouts for headers
- Monaco Editor with 400px/450px heights
- Inline status metrics in header
- Clean empty states with centered icons

## 📱 Responsive Design

```tsx
// Mobile first, then desktop
className="flex-col sm:flex-row"
className="hidden lg:flex"
className="grid md:grid-cols-2 lg:grid-cols-3"
```

## 🎨 Theme Variables (globals.css)

```css
:root {
  --background: #fafafa;
  --foreground: #171717;
  --primary: #FF6C37;
  --primary-hover: #ff5722;
  --border: #e5e7eb;
  --card-bg: #ffffff;
}
```

---

**Remember**: Consistency is key! Always use the orange theme (#FF6C37) for brand elements and primary actions throughout the entire application.
