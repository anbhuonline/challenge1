import React, { Component } from "react";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModules } from "@ag-grid-community/all-modules";
import "ag-grid-community/dist/styles/ag-grid.css";
import '@ag-grid-community/all-modules/dist/styles/ag-theme-alpine.css';
import Button from '@material-ui/core/Button';


function actionCellRenderer(params) {
  let eGui = document.createElement("div");

  let editingCells = params.api.getEditingCells();
  // checks if the rowIndex matches in at least one of the editing cells
  let isCurrentRowEditing = editingCells.some((cell) => {
    return cell.rowIndex === params.node.rowIndex;
  });

  if (isCurrentRowEditing) {
    eGui.innerHTML = `
      <button class="action-button update"  data-action="update">update</button>
      <button class="action-button cancel"  data-action="cancel">cancel</button>
    `;
  } else {
    eGui.innerHTML = `      
      <button class="action-button edit"  data-action="edit">edit</button>
      <button class="action-button delete" data-action="delete">delete</button>
    `;
  }

  return eGui;
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modules: AllCommunityModules,
      //: [ClientSideRowModelModule, RangeSelectionModule],
      columnDefs: [
        {
          field: "",
          maxWidth: 150,
          headerName: "Select all",
          headerCheckboxSelection: true,
          headerCheckboxSelectionFilteredOnly: true,
          checkboxSelection: true,
          editable: false,
        },
        { field: "name", minWidth: 150, headerName: "Name" },
        { field: "email", maxWidth: 250, headerName: "Email" },
        { field: "role", maxWidth: 120, headerName: "Role" },
        {
          headerName: "Action",
          minWidth: 150,
          cellRenderer: actionCellRenderer,
          editable: false,
          colId: "action",          
        },
      ],
      defaultColDef: {
        flex: 1,
        minWidth: 100,
        resizable: true,
        editable: true,
        paginationNumberFormatter: function (params) {
          return '[' + params.value.toLocaleString() + ']';
        },
      },
      rowSelection: 'multiple',
      rowData: null,
    };
  }

  onGridReady = (params) => {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;

    // const httpRequest = new XMLHttpRequest();
    const updateData = (data) => {
      this.setState({ rowData: data });
      params.api.paginationGoToPage(4);
    };

    // httpRequest.open("GET", "https://www.ag-grid.com/example-assets/olympic-winners.json");
    // httpRequest.open(
    //   "GET",
    //   "https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json"
    // );
    // httpRequest.send();
    // httpRequest.onreadystatechange = () => {
    //   if (httpRequest.readyState === 4 && httpRequest.status === 200) {
    //     updateData(JSON.parse(httpRequest.responseText));
    //   }
    // };

    fetch('https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json')
      .then((resp) => resp.json())
      .then((data) => updateData(data));
  };

  onPageSizeChanged = (newPageSize) => {
    var value = document.getElementById('page-size').value;
    this.gridApi.paginationSetPageSize(Number(value));
  };

  onCellClicked(params) {
    // Handle click event for action cells
    if (
      params.column.colId === "action" &&
      params.event.target.dataset.action
    ) {
      let action = params.event.target.dataset.action;

      if (action === "edit") {
        params.api.startEditingCell({
          rowIndex: params.node.rowIndex,
          // gets the first columnKey
          colKey: params.columnApi.getDisplayedCenterColumns()[0].colId,
        });
      }

      if (action === "delete") {
        params.api.applyTransaction({
          remove: [params.node.data],
        });
      }

      if (action === "update") {
        params.api.stopEditing(false);
      }

      if (action === "cancel") {
        params.api.stopEditing(true);
      }
    }
  }

  onRowEditingStarted(params) {
    params.api.refreshCells({
      columns: ["action"],
      rowNodes: [params.node],
      force: true,
    });
  }

  onRowEditingStopped(params) {
    params.api.refreshCells({
      columns: ["action"],
      rowNodes: [params.node],
      force: true,
    });
  }

  onQuickFilterChanged = () => {
    this.gridApi.setQuickFilter(document.getElementById("quickFilter").value);
  };

  onPageSizeChanged = (newPageSize) => {
    var value = document.getElementById('page-size').value;
    this.gridApi.paginationSetPageSize(Number(value));
  };

  render() {
    return (
      <div>
        <div className="example-wrapper">
          <div>
            <input
              type="text"
              style={{width:'95%', 
                fontSize:'16px', 
                margin:'18px',
                padding:'10px'}}              
              onInput={() => this.onQuickFilterChanged()}
              id="quickFilter"
              placeholder="Search here..."
            />
          </div>
          <div
            id="myGrid"
            style={{
              height: "500px",
              width: "100%",
            }}
            className="ag-theme-alpine"
          >
            <AgGridReact
              onRowEditingStopped={this.onRowEditingStopped}
              onRowEditingStarted={this.onRowEditingStarted}
              onCellClicked={this.onCellClicked}
              editType="fullRow"
              suppressRowClickSelection={true}
              suppressClickEdit={true}
              modules={this.state.modules}
              columnDefs={this.state.columnDefs}
              defaultColDef={this.state.defaultColDef}
              enableRangeSelection={true}
              onGridReady={this.onGridReady}
              rowData={this.state.rowData}
              rowSelection={this.state.rowSelection}
              pagination={true}
              paginationPageSize={10}
              paginationNumberFormatter={this.state.paginationNumberFormatter}
              icons={this.state.icons}
            />            
          </div>
        </div>        
        {/* <button style={{color:'white', 
          backgroundColor:'#eb3449', 
          padding:'10px',
          margin:'10px',
          borderRadius:'20px',
          }}>Delete selected</button> */}
          <Button 
            style={{marginLeft:"15px", marginTop:"5px"}}
            variant="outlined" 
            color="secondary"
            onClick={() => { alert('clicked') }}>Delete selected
          </Button>
      </div>
    );
  }
}

export default App;
