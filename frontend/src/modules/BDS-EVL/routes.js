import ListPage from "./ListPage";
import FormPage from "./FormPage";
import DetailPage from "./DetailPage";

export const routes = [
  { path: "/bds-evl", element: <ListPage /> },
  { path: "/bds-evl/new", element: <FormPage /> },
  { path: "/bds-evl/edit/:id", element: <FormPage isEdit /> },
  { path: "/bds-evl/:id", element: <DetailPage /> },
];
