import ListPage from "./ListPage";
import FormPage from "./FormPage";
import DetailPage from "./DetailPage";

export const routes = [
  { path: "/upt-mtu", element: <ListPage /> },
  { path: "/upt-mtu/new", element: <FormPage /> },
  { path: "/upt-mtu/edit/:id", element: <FormPage isEdit /> },
  { path: "/upt-mtu/:id", element: <DetailPage /> },
];
