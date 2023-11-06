export interface NavItem {
  displayName: string;
  iconName: string;
  route?: string;
  role:any;
  children?: NavItem[];
}
