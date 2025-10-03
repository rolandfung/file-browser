# File Explorer Wireframes

## Main Interface Layout

```mermaid
flowchart TD
    A[Header Bar] --> B[Toolbar]
    B --> C[File Explorer View]
    C --> D[Properties Panel]
    
    subgraph Header Bar
        H1[🗂️ File Explorer]
        H2[+ New View]
        H3[⚙️ Settings]
    end
    
    subgraph Toolbar
        T1[📁 New Folder]
        T2[📄 New File] 
        T3[🗑️ Remove]
        T4[🔍 Search]
        T5[📊 Example Data]
    end
    
    subgraph File Explorer View
        F1[📂 Root]
        F2[├── 📁 Documents]
        F3[├── 📁 Images] 
        F4[├── 📄 readme.txt]
        F5[└── 🏙️ london.city]
    end
    
    subgraph Properties Panel
        P1[Selected Item Info]
        P2[Name: Documents]
        P3[Type: Folder]
        P4[Size: 2.5 MB]
        P5[Modified: Oct 3, 2025]
    end
```

## Core Functionality Wireframes

### 1. File Selection State

```mermaid
stateDiagram-v2
    [*] --> NoSelection: Initial State
    NoSelection --> FileSelected: Click File
    NoSelection --> FolderSelected: Click Folder
    FileSelected --> NoSelection: Click Empty Space
    FolderSelected --> NoSelection: Click Empty Space
    FileSelected --> FolderSelected: Click Folder
    FolderSelected --> FileSelected: Click File
    
    state FileSelected {
        [*] --> ShowFileInfo
        ShowFileInfo --> EnableFileActions
        EnableFileActions --> [*]
    }
    
    state FolderSelected {
        [*] --> ShowFolderInfo
        ShowFolderInfo --> EnableFolderActions
        EnableFolderActions --> AllowExpansion
        AllowExpansion --> [*]
    }
```

### 2. Directory Expansion/Collapse

```mermaid
flowchart LR
    A[📁 Documents ▶️] -->|Click Expand| B[📁 Documents ▼️<br/>├── 📄 file1.txt<br/>├── 📄 file2.pdf<br/>└── 📁 Subfolder ▶️]
    B -->|Click Collapse| A
    
    B -->|Click Subfolder Expand| C[📁 Documents ▼️<br/>├── 📄 file1.txt<br/>├── 📄 file2.pdf<br/>└── 📁 Subfolder ▼️<br/>&nbsp;&nbsp;&nbsp;&nbsp;├── 📄 nested1.txt<br/>&nbsp;&nbsp;&nbsp;&nbsp;└── 📄 nested2.jpg]
```

### 3. Create New File/Directory Flow

```mermaid
flowchart TD
    A[Select Parent Directory] --> B{Action Type}
    B -->|New File| C[Show File Creation Dialog]
    B -->|New Folder| D[Show Folder Creation Dialog]
    
    C --> E[Enter File Name]
    D --> F[Enter Folder Name]
    
    E --> G{Valid Name?}
    F --> H{Valid Name?}
    
    G -->|Yes| I[Create File in Selected Directory]
    G -->|No| J[Show Error Message]
    H -->|Yes| K[Create Folder in Selected Directory]
    H -->|No| L[Show Error Message]
    
    J --> E
    L --> F
    
    I --> M[Refresh File Tree]
    K --> M
```

## Search Functionality Wireframe

```mermaid
flowchart TD
    A[Search Bar] --> B[🔍 Search Button]
    A --> C[☑️ Restrict to Subtree]
    
    B --> D{Search Scope}
    D -->|Global| E[Search Entire File System]
    D -->|Restricted| F[Search Selected Directory Only]
    
    E --> G[Display All Matching Results]
    F --> H[Display Filtered Results]
    
    G --> I[Results List with Full Paths]
    H --> I
    
    subgraph Search Results
        I --> J[📄 document.txt - /root/docs/]
        I --> K[📄 document.pdf - /root/backup/]
        I --> L[📁 document_folder - /root/projects/]
    end
```

## Multiple Views Layout

```mermaid
flowchart TD
    A[Browser Window] --> B[View Tabs]
    B --> C[View 1: Explorer A]
    B --> D[View 2: Explorer B]
    
    subgraph View 1: Explorer A
        E[📁 /home/user]
        F[├── 📁 Documents]
        G[├── 📁 Pictures]
        H[└── 📄 notes.txt]
    end
    
    subgraph View 2: Explorer B  
        I[📁 /projects]
        J[├── 📁 web-app]
        K[├── 📁 mobile-app]
        L[└── 📄 README.md]
    end
    
    subgraph Drag & Drop Between Views
        M[📄 File from View 1] -.->|Drag & Drop| N[📁 Folder in View 2]
    end
```

## Mobile Responsive Design

```mermaid
flowchart TD
    A[Mobile Layout] --> B[Collapsible Header]
    B --> C[Touch-Optimized Toolbar]
    C --> D[Vertical File List]
    D --> E[Swipe Actions]
    
    subgraph Desktop View
        F[Wide Layout with Sidebar]
        G[Horizontal Toolbar]
        H[Tree View with Icons]
        I[Right-Click Context Menus]
    end
    
    subgraph Mobile View
        J[Narrow Layout, No Sidebar]
        K[Vertical Icon Stack]
        L[List View with Large Touch Targets]
        M[Long-Press Actions]
    end
    
    F -.->|Responsive Breakpoint| J
    G -.->|Responsive Breakpoint| K
    H -.->|Responsive Breakpoint| L
    I -.->|Responsive Breakpoint| M
```

## Multi-Select and Actions

```mermaid
stateDiagram-v2
    [*] --> SingleSelect: Click Item
    SingleSelect --> MultiSelect: Shift+Click
    MultiSelect --> MultiSelect: Shift+Click More
    MultiSelect --> SingleSelect: Click Different Item
    SingleSelect --> [*]: Click Empty Space
    MultiSelect --> [*]: Click Empty Space
    
    state MultiSelect {
        [*] --> ShowMultiActions
        ShowMultiActions --> BulkRemove
        ShowMultiActions --> BulkMove
        BulkRemove --> ConfirmDialog
        BulkMove --> DragDropTarget
    }
```

## Weather API Integration (.city files)

```mermaid
flowchart TD
    A[📄 london.city] -->|Double Click| B[Detect .city Extension]
    B --> C[Extract City Name: 'london']
    C --> D[Call OpenWeatherMap API]
    D --> E{API Response}
    E -->|Success| F[Create weather.json File]
    E -->|Error| G[Show Error Dialog]
    F --> H[Download File to Browser]
    G --> I[Retry Option]
    
    subgraph API Call Details
        J[GET: api.openweathermap.org/data/2.5/weather?q=london&appid=KEY]
    end
```

## Error Handling States

```mermaid
flowchart TD
    A[User Action] --> B{Validation Check}
    B -->|Valid| C[Execute Action]
    B -->|Invalid| D[Show Error Message]
    
    D --> E[Error Types]
    E --> F[📛 Invalid File Name]
    E --> G[📛 No Parent Selected]
    E --> H[📛 Permission Denied]
    E --> I[📛 Network Error]
    
    F --> J[Red Border on Input Field]
    G --> K[Highlight Directory Selection]
    H --> L[Show Permission Dialog]
    I --> M[Retry Button]
    
    J --> N[Allow User to Correct]
    K --> N
    L --> N
    M --> N
    
    N --> A
```

## File Type Icons Mapping

```mermaid
flowchart LR
    A[File Extension Detection] --> B{Extension Type}
    
    B -->|.txt, .md| C[📄 Text Icon]
    B -->|.jpg, .png, .gif| D[🖼️ Image Icon]
    B -->|.pdf| E[📋 PDF Icon]
    B -->|.js, .ts, .html| F[💻 Code Icon]
    B -->|.mp3, .wav| G[🎵 Audio Icon]
    B -->|.mp4, .avi| H[🎬 Video Icon]
    B -->|.zip, .rar| I[📦 Archive Icon]
    B -->|.city| J[🏙️ City Icon]
    B -->|folder| K[📁 Folder Icon]
    B -->|unknown| L[📄 Generic Icon]
```
