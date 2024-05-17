import "./App.css";
import { List } from "antd";
import { BASE_URL, routes } from "./router";

function App() {
  function handleClick(info) {
    if (location.origin.indexOf(BASE_URL) > -1) {
      const path = info.path.replace(/three-demo/, '');
      window.open(`${location.origin}/${path}`);
    } else {
      window.open(`${location.origin}/${info.path}`);
    }
  }
  return (
    <List
      size="large"
      header={
        <div
          style={{ width: "100%", display: "flex", justifyContent: "center" }}
        >
          DEMO列表
        </div>
      }
      bordered
      dataSource={routes.slice(1)}
      renderItem={(item) => (
        <List.Item style={{ display: "flex", justifyContent: "center" }}>
          <a onClick={() => handleClick(item)}>{item._info.title}</a>
        </List.Item>
      )}
    />
  );
}

export default App;
