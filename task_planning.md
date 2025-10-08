# Task Planning for File Browser Application

## Product requirements

### Core requirements

1. ✅ Select a file/directory: Clicking on a file or directory “selects” it (useful for other operations, below).
1. ✅ Create a new file/directory: The current selected directory is the parent and the user should be required to name the new file/directory.
1. ✅ Expand a directory: Clicking on a directory’s “Expand” button should reveal all the files and directories contained inside. Clicking again should “collapse” the view.
1. ✅ Remove a file/directory: Remove the selected file or directory.
1. ✅ Example button: Create 10K files/directories (there should be some nested element). This will be used during the demo.

### Recommended Extensions - complete at least 1

1. ✅ Move a file/directory: Move an existing file or directory into another directory. It can happen using drag and drop for example.
1. ✅ Find a file/directory: Given a filename, find all the files and directories that have exactly that name.
1. ✅ Restrict to a subtree: restrict the search to the selected directory
1. ✅ Files have the correct icon: Every known file extension will have an associated icon.
1. ✅ Drill down / roll up view: Make the selected directory the root in the current view and going back
1. ✅ Multiple views: Users may create additional “views” of the same file system (in the same browser window). Users may independently browse in each view. Users may use drag and drop between views.
1. ✅ Download weather for a city specified in the file name: The file is going to be the name of the city that we want to know the weather for (with “.city” extension). For example “london.city” should initiate a download of the weather json file for that city. You can use the api https://openweathermap.org/current.
1. Responsive design: Your frontend works just as well on small-screen formats (i.e. mobile) as it does on a full-sized screen (i.e laptop browser).
1. ✅ Multiselect: Users may select multiple files / directories (i.e shift-select). Extend existing functions (e.g remove) to support multi-select.
1. ✅ File/directory info: Selecting a file/directory displays useful information about the selected item.

### Personal extensions

Extra features I would like to implement if time permits:

1. ✅ Playwright automation testing
1. ✅ List virtualization: Implement list virtualization techniques to ensure smooth scrolling and interaction of 10k items
1. ✅ Breadcrumbs
1. ✅ Expand/Collapse all
1. ✅ Navigation history (navigate back)
1. ✅ Move files with drag-and-drop into a breadcrumb
1. ✅ Show move progress (generator function)
1. ✅ Resolve move conflicts (skip/replace/cancel) using a generator function
1. ✅ Undo a move, delete, or add operation with ctrl-z
1. ✅ Type/name sorting
1. ✅ Put file generation function into a web worker to avoid blocking the main thread, and have it cache the generated structure in local storage for faster subsequent generations.
1. Move selected files with toolbar button which opens dialog with a directory navigator so user can move files across many levels quickly
1. Dark mode
1. Report code coverage for Playwright tests (turns out this is a headache to set up and not worth the effort for this demo).

## User Stories

Based on implemented Playwright e2e test scenarios:

| Priority                         | Story ID | Test File                        | Given                                                     | When                                                                    | Then                                                                                   |
| -------------------------------- | -------- | -------------------------------- | --------------------------------------------------------- | ----------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| **Navigation & Breadcrumbs**     |
| P1                               | US-01    | breadcrumbNavAndDrag.spec.ts     | I am viewing nested directories                           | I navigate through Libraries_1_0 → Images_2_2 → Assets_3_3              | Breadcrumbs show the full navigation path: / → Libraries_1_0 → Images_2_2 → Assets_3_3 |
| P1                               | US-02    | breadcrumbNavAndDrag.spec.ts     | I am in a nested directory with files                     | I drag a file onto a breadcrumb directory                               | The file is moved to that directory level and no longer visible at current level       |
| P1                               | US-03    | navigation.spec.ts               | I have navigated into nested directories                  | I click the "Navigate Up" button                                        | I move up one directory level in the hierarchy                                         |
| P1                               | US-04    | navigation.spec.ts               | I have navigated through multiple directories             | I click the back button (⬅️)                                            | I return to the previously visited directory                                           |
| **File & Directory Management**  |
| P1                               | US-05    | createDeleteDir.spec.ts          | I want to create a new directory                          | I click "Create New Directory", enter "Playwright", and click Create    | A new directory named "Playwright" is created and visible                              |
| P1                               | US-06    | createDeleteDir.spec.ts          | I have a directory I want to remove                       | I select the directory, click delete (🗑️), and confirm                  | The directory is deleted and no longer visible                                         |
| P1                               | US-07    | createDeleteDir.spec.ts          | I have created directories "ParentDir" and "ChildDir"     | I drag "ChildDir" onto "ParentDir"                                      | "ChildDir" moves inside "ParentDir" and is visible when ParentDir is expanded          |
| P1                               | US-08    | createDeleteFile.spec.ts         | I want to create a new file                               | I click "Create New File", enter "playwright.pdf", and click Create     | A new file named "playwright.pdf" is created and visible                               |
| P1                               | US-09    | createDeleteFile.spec.ts         | I have a file I want to remove                            | I select the file, click delete (🗑️), and confirm                       | The file is deleted and no longer visible                                              |
| P1                               | US-10    | createDeleteFile.spec.ts         | I want to organize files into directories                 | I drag a file onto a directory                                          | The file moves into the directory and is visible when the directory is expanded        |
| **Expand/Collapse Operations**   |
| P1                               | US-11    | expandCollapseAll.spec.ts        | I have directories with nested content                    | I click the expand all button (📂)                                      | All directories expand showing nested content like Images_2_2, Assets_3_3, Media_4_29  |
| P1                               | US-12    | expandCollapseAll.spec.ts        | I have expanded directories                               | I click the collapse all button (📁)                                    | All directories collapse hiding their nested content                                   |
| **Multi-View Support**           |
| P2                               | US-13    | multiViews.spec.ts               | I want multiple file system views                         | I click "Add View"                                                      | A second independent file system view is created                                       |
| P2                               | US-14    | multiViews.spec.ts               | I have multiple views open and delete a file in one view  | I delete a file in the second view                                      | The file disappears from all views (changes are synchronized)                          |
| P2                               | US-15    | multiViews.spec.ts               | I have multiple views open                                | I click "Close File System View" on one view                            | That view is closed, leaving only one view remaining                                   |
| P2                               | US-16    | dragBetweenViews.spec.ts         | I have multiple views and want to move files between them | I select files in one view and drag them to a directory in another view | The files move to the destination directory in the target view                         |
| **Selection & File Information** |
| P2                               | US-17    | fileInfo.spec.ts                 | I want to see selection details                           | I click on a single file                                                | The interface shows "1 item selected: /filename"                                       |
| P2                               | US-18    | fileInfo.spec.ts                 | I want to select multiple files                           | I click one file, then shift-click on another file                      | The interface shows "3 items selected" (including files in between)                    |
| **Search & Weather Integration** |
| P2                               | US-19    | searchAndWeatherDownload.spec.ts | I want to find specific files                             | I type "city" in the search box                                         | All displayed files contain "city" in their name                                       |
| P2                               | US-20    | searchAndWeatherDownload.spec.ts | I have selected a .city file (e.g. "athens\_\_GR.city")   | I click the weather download button (🌤️)                                | A weather JSON file is downloaded with name "athens\_\_GR_weather.json"                |
| **Sorting & Organization**       |
| P2                               | US-21    | sort.spec.ts                     | I am viewing the file list                                | I observe the default sorting                                           | Files are sorted by type (directories first, then files)                               |
| P2                               | US-22    | sort.spec.ts                     | I want to reverse the sort order                          | I click "Toggle Asc/Desc"                                               | The sort order reverses (files first, then directories)                                |
| P2                               | US-23    | sort.spec.ts                     | I want to sort by name                                    | I select "Name" from the sort dropdown                                  | Files and directories are sorted alphabetically by name                                |
| **Undo Operations**              |
| P2                               | US-24    | undo.spec.ts                     | I have created a directory                                | I press Ctrl+Z (or Cmd+Z)                                               | The directory creation is undone and the directory disappears                          |
| P2                               | US-25    | undo.spec.ts                     | I have created a file                                     | I press Ctrl+Z (or Cmd+Z)                                               | The file creation is undone and the file disappears                                    |
| P2                               | US-26    | undo.spec.ts                     | I have deleted a file                                     | I press Ctrl+Z (or Cmd+Z)                                               | The file deletion is undone and the file reappears                                     |
| P2                               | US-27    | undo.spec.ts                     | I have moved nested directory structures                  | I press Ctrl+Z (or Cmd+Z)                                               | The move operation is undone and files return to their original locations              |
| **Move Conflict Resolution**     |
| P2                               | US-28    | moveConflicts.spec.ts            | I am moving files/directories that would create conflicts | I drag a directory to a location where files with same names exist      | A conflict dialog appears allowing me to choose "Replace", "Skip", or "Cancel"         |

### Test Coverage Summary

The e2e tests cover the following key functionality:

- ✅ **Navigation**: Breadcrumb navigation, up/back buttons
- ✅ **File Operations**: Create, delete, move files and directories
- ✅ **Drag & Drop**: Between directories, between views, onto breadcrumbs
- ✅ **Multi-View**: Independent views with synchronized changes
- ✅ **Selection**: Single and multi-select with shift-click
- ✅ **Search**: File filtering with real-time results
- ✅ **Weather Integration**: Download weather data for .city files
- ✅ **Sorting**: By type and name, with asc/desc toggle
- ✅ **Undo**: Full undo support for create, delete, and move operations
- ✅ **Expand/Collapse**: Individual and bulk directory operations
- ✅ **Move Conflicts**: Conflict resolution with Replace/Skip/Cancel options

### Missing Test Coverage

- Responsive design testing
- Error handling scenarios
- Performance testing with large datasets
- Keyboard navigation and accessibility

### Technical Notes

- FileNode: class representing a file or directory.
- FileSystem:
  - Stores file information in a tree structure
  - Contains methods for manipulating the file system (create, delete, move, search). Create, delete, and move operations are naturally O(1), but we check for name conflicts on moves making them O(n) in the worst case.
  - Extends EventTarget to notify view of changes to which directories are being added to or removed from.
    - FileSystemView only needs to re-render if the current context node (the directory being viewed) is a parent of any of the directory nodes being added to or removed from, as indicated by the details of the event.
    - This approach was chosen over a more "React-centric" way of state management using React built-ins like `useState`, `useSelector`, or Redux, because the slice of state we are listening to can _change_ as we navigate through the directories.
- FileSystemView: Binds to a FileSystem instance and renders the current context node (directory) and its children. Contains components for navigating, selecting, creating, deleting, moving, searching, and sorting files/directories.
