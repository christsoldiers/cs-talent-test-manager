# Result Declaration System Guide

## Overview
The Result Declaration System provides admins with control over when competition results become publicly visible. This ensures that results are reviewed and approved before being displayed in the leaderboard and marquee.

## Key Features

### 1. **Admin Control**
- Admins can declare results for individual events (by event + category)
- Admins can declare results for group events (by group event)
- Admins can revert declarations if needed
- Results can only be declared after all judges have locked their scores

### 2. **Visibility Control**
- **Leaderboard**: Only declared results appear in section, church, and individual rankings
- **Marquee (Home Page)**: Only declared results are included in champion calculations
- **Undeclared results**: Remain hidden from public view even if judges have locked scores

### 3. **Judge Lockout**
- Once a result is declared, judges cannot update scores
- This prevents accidental changes after official publication
- Admins must revert declaration to allow judges to make corrections

## How to Use

### For Individual Events

#### Declaring Results
1. Navigate to **Admin Dashboard** → **View Results**
2. Select the event and category from dropdowns
3. Verify that results are correct (all judges have locked)
4. Click the **"Declare Result"** button
5. A green "✓ Result Declared" badge will appear

#### Reverting Declaration
1. Go to the same event-category in **View Results**
2. Click the **"Revert Declaration"** button
3. The status will change to "⚠ Not Declared"
4. Judges can now update scores if needed

### For Group Events

#### Declaring Results
1. Navigate to **Admin Dashboard** → **Group Results**
2. Select the group event from the dropdown
3. Verify the team rankings are correct
4. Click the **"Declare Result"** button
5. A green "✓ Result Declared" badge will appear

#### Reverting Declaration
1. Go to the same group event in **Group Results**
2. Click the **"Revert Declaration"** button
3. The status will change to "⚠ Not Declared"
4. Judges can now update scores if needed

## Technical Implementation

### Storage Structure
```javascript
declaredResults: [
  {
    eventId: 1,
    category: "Junior",
    declaredAt: "2024-01-15T10:30:00Z",
    declaredBy: "admin"
  },
  {
    groupEventId: 2,
    declaredAt: "2024-01-15T11:00:00Z",
    declaredBy: "admin"
  }
]
```

### Service Methods

#### Individual Events
- `StorageService.declareResult(eventId, category)` - Declare individual event result
- `StorageService.revertDeclaration(eventId, category)` - Revert individual declaration
- `StorageService.isResultDeclared(eventId, category)` - Check if declared

#### Group Events
- `StorageService.declareGroupResult(groupEventId)` - Declare group event result
- `StorageService.revertGroupDeclaration(groupEventId)` - Revert group declaration
- `StorageService.isGroupResultDeclared(groupEventId)` - Check if declared

#### Utility Methods
- `StorageService.getDeclaredResults()` - Get all declarations
- `StorageService.getDeclaredIndividualEvents()` - Get individual declarations only
- `StorageService.getDeclaredGroupEvents()` - Get group declarations only

## Workflow

### Typical Competition Flow

1. **Event Setup**
   - Admin creates events and registers participants
   - Judges are assigned credentials

2. **Scoring Phase**
   - Judges score participants/teams
   - Scores can be updated as needed
   - Judges lock scores when complete

3. **Review Phase** *(New Step)*
   - Admin reviews locked results
   - Verifies rankings and points
   - Can check for any discrepancies

4. **Declaration Phase** *(New Step)*
   - Admin declares results event-by-event
   - Declared results appear in leaderboard
   - Marquee updates with declared champions

5. **Publication**
   - Only declared results are public
   - Undeclared events remain hidden
   - Allows controlled release of results

6. **Corrections** (If Needed)
   - Admin reverts declaration
   - Judges can update scores
   - Admin re-declares after verification

## Components Updated

### Admin Components
- **ResultsView.js** - Individual event declaration controls
- **GroupResults.js** - Group event declaration controls
- **Leaderboard.js** - Filters to show only declared results
- **Home.js** - Marquee filters to show only declared results

### Judge Components
- **JudgeDashboard.js** - Prevents scoring after declaration

### Styling
- **ResultsView.css** - Declaration control styles
- **GroupResults.css** - Group declaration control styles

## Visual Indicators

### Declared Status
- **Badge**: Green with checkmark (✓ Result Declared)
- **Button**: Orange "Revert Declaration" button
- **Effect**: Results visible in leaderboard/marquee

### Not Declared Status
- **Badge**: Orange with warning (⚠ Not Declared)
- **Button**: Green "Declare Result" button
- **Effect**: Results hidden from public view

## Benefits

1. **Quality Control**: Admin reviews before publishing
2. **Prevent Premature Disclosure**: Results hidden until ready
3. **Flexible Publishing**: Declare events individually as verified
4. **Error Prevention**: Judges locked out after declaration
5. **Reversible**: Declarations can be reverted if needed
6. **Transparency**: Clear status indicators for admins

## Best Practices

1. **Review Before Declaring**: Always verify results are correct
2. **Declare Progressively**: Don't wait to declare all at once
3. **Communicate**: Let judges know when scoring window closes
4. **Test Revert**: Ensure you can revert if needed
5. **Document**: Keep track of which events are declared
6. **Announce**: Inform participants when results are declared

## Future Enhancements (Firebase)

When migrating to Firebase, consider adding:
- Admin username tracking for declarations
- Declaration history/audit log
- Email notifications on declaration
- Bulk declaration for multiple events
- Scheduled auto-declaration
- Declaration approval workflow
- Role-based declaration permissions

## Troubleshooting

**Q: Can't declare result**
- Check that all judges have locked scores
- Verify event and category are selected

**Q: Judges can't score after locking**
- This is normal if result is declared
- Admin must revert declaration first

**Q: Leaderboard is empty**
- No results have been declared yet
- Declare results to populate leaderboard

**Q: Wrong ranking after declaration**
- Revert declaration
- Check/update judge scores
- Re-declare when verified

**Q: Can't revert declaration**
- Ensure you're on the correct event/category
- Check that result was actually declared
