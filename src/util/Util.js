import { MainComponent } from '../components/MainComponent'
import { PublicationsComponent } from '../components/PublicationsComponent'
import { TeamComponent } from '../components/TeamComponent'
import { LDESComponent } from '../components/LDESComponent';

import Icon from '@material-ui/core/Icon';
import HomeIcon from '@material-ui/icons/Home';
import InsertDriveFileIcon from '@material-ui/icons/InsertDriveFile';
import LinearScaleIcon from '@material-ui/icons/LinearScale';
import NotesIcon from '@material-ui/icons/Notes';


import githublogo from "../img/github.svg"
import PersonIcon from '@material-ui/icons/Person';

const GITHUB = "https://github.com/treecg"
const SPEC = "https://treecg.github.io/specification"


export const availableViews = {
  home:           {id:"Home",         label:'Home',                       component: MainComponent,           icon: <HomeIcon />,                                  target: '/',              newtab: false},  
  spec:           {id:"Spec",         label:'Specification',              component: null,                    icon: <NotesIcon />,                                 target: GITHUB,           newtab: true},
  ldes:           {id:"LDES",         label:'Linked Data Event Streams',  component: LDESComponent,           icon: <LinearScaleIcon />,                           target: '/ldes',          newtab: false},
  publications:   {id:"Publications", label:'Publications',               component: PublicationsComponent,   icon: <InsertDriveFileIcon />,                       target: '/publications',  newtab: false},
  team:           {id:"Team",         label:'Team',                       component: TeamComponent,           icon: <PersonIcon />,                                target: '/team',          newtab: false},
  github:         {id:"Github",       label:'Github',                     component: null,                    icon: <Icon><img alt="" src={githublogo} /></Icon>,  target: SPEC,             newtab: true},
}