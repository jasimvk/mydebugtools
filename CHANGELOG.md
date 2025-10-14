# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

- Initial changelog setup.
- **Color Picker Tool**:
  - Improved UI with better contrast and readability
  - Fixed background colors for color value displays
  - Enhanced text colors and added proper borders
  - Added individual copy buttons for each color format
  - Improved layout for advanced color information view
  - Better responsiveness for mobile devices
  - Added empty state for recent colors
  - **Added opacity/alpha selector with slider (0-100%)**
  - **Added RGBA and HSLA color format support**
  - **Added checkered background pattern to preview transparency**
  - **Enhanced color preview to show real-time opacity changes**
- **Icon Finder Tool**:
  - Optimized memory usage with on-demand loading of icon libraries
  - Changed default to load only one library at a time
  - Added progress indicators for multi-library loading
  - Improved instructions and user guidance

## [1.0.0] - 2025-03-28

- Initial release of MyDebugTools project.
- Core infrastructure and setup.
- Tools: **JSON Formatter & Beautifier** (basic), **Color Converter** (basic).

## [1.1.0] - 2025-04-02

- Major update to **JSON Formatter & Beautifier**:
  - Improved UI and advanced features.
  - Added transform, repair, and export capabilities.
  - Large document support with chunked loading.
  - Offline support and file system access.
  - Document statistics and progress tracking.
  - Switched to Monaco Editor for tree view.
- **Chrome Extension**: initial release and integration with web tools.

## [1.2.0] - 2025-04-03

- **API Tester**:
  - Enhanced UI/UX, authentication, and response handling.

## [1.3.0] - 2025-04-08

- **Base64 Converter**:
  - Added image and PDF to Base64 conversion features.

## [1.4.0] - 2025-04-17

- Added/Improved the following tools:
  - **Regex Tester**: real-time matching and replacement.
  - **HTML Validator & Formatter**: validate and beautify HTML code.
  - **CSS Minifier & Beautifier**: minify, beautify, and validate CSS code.
  - **Markdown Previewer**: live markdown rendering.
  - **Color Converter**: enhanced color conversion features.
  - **Code Diff Viewer**: compare code snippets side by side.
- Improved JSON tools layout and navigation structure.
- Various bug fixes and UI improvements.

## [1.5.0] - 2025-04-25

- **Database Query Tool (SQLite)**: added to tools page sidebar, supports running SQL queries on local databases. 