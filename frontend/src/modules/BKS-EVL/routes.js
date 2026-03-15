import ListPage from "./ListPage";
import FormPage from "./FormPage";
import DetailPage from "./DetailPage";

export const routes = [
  { path: "/bks-evl", element: <ListPage /> },
  { path: "/bks-evl/new", element: <FormPage /> },
  { path: "/bks-evl/edit/:id", element: <FormPage isEdit /> },
  { path: "/bks-evl/:id", element: <DetailPage /> },
];
