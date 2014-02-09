window.addEventListener('load', init, false);

//Multiple Canvas
var canvasBg = document.getElementById('GameCanvas');
ctxBg = canvasBg.getContext('2d');
var canvasPoints = document.getElementById('PointCanvas');
ctxPts = canvasPoints.getContext('2d');
var canvasOperators = document.getElementById('OperatorCanvas');
ctxOps = canvasOperators.getContext('2d');
var canvasGrid = document.getElementById('GridCanvas');
ctxGrid = canvasGrid.getContext('2d');
var canvasNumberGrid = document.getElementById('NumberGridCanvas');
ctxNumGrid = canvasNumberGrid.getContext('2d');
var canvasExpression = document.getElementById('ExpressionCanvas');
ctxExp = canvasExpression.getContext('2d');
var canvasTimer = document.getElementById('TimerCanvas');
ctxTime = canvasTimer.getContext('2d');
var canvasGratii = document.getElementById('GratiiCanvas');
ctxGratii = canvasGratii.getContext('2d');
var canvasAnimation = document.getElementById('AnimationCanvas');
ctxAnimation = canvasAnimation.getContext('2d');
var canvasSkipPrompt = document.getElementById('SkipPromptCanvas');
ctxSkip = canvasSkipPrompt.getContext('2d');


//declare variables
var gratii = 0;
var gratiiMultiplier = 1;
var score = 3;
var pressX = 0; //x coord of where user touched the screen
var pressY = 0; //y coord of there user touched the screen
var cardCombo = 0; //holds randomly generated number to pull from array

//when button pressed, that number or operator is assigned to its respectable position of the equation
var position1 = '';
var position2 = '';
var position3 = '';
var position4 = '';
var position5 = '';
var position6 = '';
var position7 = '';
var position8 = '';
var position9 = '';
var position10 = '';
var position11 = '';

//later is set to equal all of the positions added together
var expression = '';

//which grid square was pressed? to add the correct number to the expression
var gridNum = ''; //Top Left=0, Top Right=1 Bottom Left=2 Bottom Right=3

//current operation clicked
var operation = '';

//keeps track of parens
var openParen = 0;
var closedParen = 0;

//locks for controling expression building logic
var topLeftLock = false;
var topRightLock = false;
var bottomLeftLock = false;
var bottomRightLock = false;
var lockGrid = true; //locks all of grid
var lockMDAS = true; //locks multiplication, division, addition, subtraction
var lockLeftParen = false; //locks left paren
var lockRightParen = false; //locks right paren
var lockSkip = true; //locks skip button
var lockBackspace = true;
var lockPoints = true;

var skipDisplayCounter = 6;
var drawIntervalSkipDisplay;
var timerFps = 10;
var fps = 1000; //1 frame per second for timers
var drawInterval; //draw interval for 60 sec timer
var drawIntervalThreeSec; //draw interval for round start timer and calculation anuimation
var counter = 0; //value of countdown timer
var threeSecCounter = 3; //sets value of countdown timer

var transparency = 1;
var hintFps = 100;
var drawHintInterval;
var hintCounter = 55;
var pointUsage = 0;
var incorrectAnswerTracker = false;

var incorrectTryAgain = false;

//Load Images
var splash = new Image();
splash.src = 'images/splash.png';

var instructions = new Image();
instructions.src = 'images/instructions.png';

var background = new Image();
background.src = 'images/background.png?c=2';

var grid = new Image();
grid.src = 'images/grid.png';

var grid_bottomleft = new Image();
grid_bottomleft.src = 'images/grid_bottomleft.png';

var grid_bottomright = new Image();
grid_bottomright.src = 'images/grid_bottomright.png';

var grid_topleft = new Image();
grid_topleft.src = 'images/grid_topleft.png';

var grid_topright = new Image();
grid_topright.src = 'images/grid_topright.png';

var op_addition_down = new Image();
op_addition_down.src = 'images/op_addition_down.png';

var op_addition_up = new Image();
op_addition_up.src = 'images/op_addition_up.png';

var op_division_down = new Image();
op_division_down.src = 'images/op_division_down.png';

var op_division_up = new Image();
op_division_up.src = 'images/op_division_up.png';

var op_leftparen_down = new Image();
op_leftparen_down.src = 'images/op_leftparen_down.png';

var op_leftparen_up = new Image();
op_leftparen_up.src = 'images/op_leftparen_up.png';

var op_rightparen_down = new Image();
op_rightparen_down.src = 'images/op_rightparen_down.png';

var op_rightparen_up = new Image();
op_rightparen_up.src = 'images/op_rightparen_up.png';

var op_multiplication_down = new Image();
op_multiplication_down.src = 'images/op_multiplication_down.png';

var op_multiplication_up = new Image();
op_multiplication_up.src = 'images/op_multiplication_up.png';

var op_subtraction_down = new Image();
op_subtraction_down.src = 'images/op_subtraction_down.png';

var op_subtraction_up = new Image();
op_subtraction_up.src = 'images/op_subtraction_up.png';

var point_empty = new Image();
point_empty.src = 'images/point_empty.png';

var point_full = new Image();
point_full.src = 'images/point_full.png';

var imageBackspace = new Image();
imageBackspace.src = 'images/backspace_up.png';

var imageBackspaceDown = new Image();
imageBackspaceDown.src = 'images/backspace_down.png';

var timerBlue = new Image();
timerBlue.src = 'images/timer_blue.png';

var timerGrey = new Image();
timerGrey.src = 'images/timer_grey.png';

var timerRed = new Image();
timerRed.src = 'images/timer_red.png';

var gridTopLeftUsed= new Image();
gridTopLeftUsed.src = 'images/grid_topleft_used.png';

var gridTopRightUsed = new Image();
gridTopRightUsed.src = 'images/grid_topright_used.png';

var gridBottomLeftUsed = new Image();
gridBottomLeftUsed.src = 'images/grid_bottomleft_used.png';

var gridBottomRightUsed = new Image();
gridBottomRightUsed.src = 'images/grid_bottomright_used.png';

var backspaceRedDown = new Image();
backspaceRedDown.src = 'images/backspace_red_down.png';

var gratiiCoin = new Image();
gratiiCoin.src = 'images/gratiicoin50.png';

//Long Ass Nested Array of Possible Combinations (402)
var Combinations = new Array();
Combinations[0] = new Array( "1", "1", "1", "8", "((1+", "1)+", "1)", "*8" );
Combinations[1] = new Array( "1", "1", "2", "6", "(1+", "1)+", "2)", "*6" );
Combinations[2] = new Array( "1", "1", "2", "7", "(1+", "2)*", "(1", "+7)" );
Combinations[3] = new Array( "1", "1", "2", "8", "((1", "+2)*", "1)", "*8" );
Combinations[4] = new Array( "1", "1", "2", "9", "(1+", "2)*", "(9", "-1)" );
Combinations[5] = new Array( "1", "1", "3", "4", "((1", "+1)*", "3)", "*4" );
Combinations[6] = new Array( "1", "1", "3", "5", "(1+", "3)*", "(1", "+5)" );
Combinations[7] = new Array( "1", "1", "3", "6", "((1", "+1)+", "6)", "*3" );
Combinations[8] = new Array( "1", "1", "3", "7", "((1+", "7)*", "1)", "*3" );
Combinations[9] = new Array( "1", "1", "3", "8", "((1+", "3)-", "1)", "*8" );
Combinations[10] = new Array( "1", "1", "3", "9", "((1*", "9)-", "1)", "*3" );
Combinations[11] = new Array( "1", "1", "4", "4", "((1+", "1)+", "4)", "*4" );
Combinations[12] = new Array( "1", "1", "4", "5", "((1+", "4)*", "5)", "-1" );
Combinations[13] = new Array( "1", "1", "4", "6", "((1+", "4)-", "1)", "*6" );
Combinations[14] = new Array( "1", "1", "4", "7", "((1*", "7)-", "1)", "*4" );
Combinations[15] = new Array( "1", "1", "4", "8", "((1*", "4)-", "1)", "*8" );
Combinations[16] = new Array( "1", "1", "4", "9", "(1-", "4)*", "(1", "-9)" );
Combinations[17] = new Array( "1", "1", "5", "5", "((1*", "5)*", "5)", "-1" );
Combinations[18] = new Array( "1", "1", "5", "6", "((1*", "5)-", "1)", "*6" );
Combinations[19] = new Array( "1", "1", "5", "7", "(1+", "1)*", "(5", "+7)" );
Combinations[20] = new Array( "1", "1", "5", "8", "((5-", "1)-", "1)", "*8" );
Combinations[21] = new Array( "1", "1", "6", "6", "((6-", "1)-", "1)", "*6" );
Combinations[23] = new Array( "1", "1", "6", "9", "((1+", "1)*", "9)", "+6" );
Combinations[24] = new Array( "1", "1", "8", "8", "((1+", "1)*", "8)", "+8" );//FIXED
Combinations[25] = new Array( "1", "2", "2", "4", "((1+", "2)*", "2)", "*4" );
Combinations[26] = new Array( "1", "2", "2", "5", "((1+", "5)*", "2)", "*2" );
Combinations[27] = new Array( "1", "2", "2", "6", "((1*", "2)+", "2)", "*6" );
Combinations[28] = new Array( "1", "2", "2", "7", "((7-", "1)*", "2)", "*2" );
Combinations[29] = new Array( "1", "2", "2", "8", "((2+", "2)-", "1)", "*8" );
Combinations[30] = new Array( "1", "2", "2", "9", "((1+", "2)+", "9)", "*2" );
Combinations[31] = new Array( "1", "2", "3", "3", "((1+", "3)*", "2)", "*3" );
Combinations[32] = new Array( "1", "2", "3", "4", "((1+", "2)+", "3)", "*4" );
Combinations[33] = new Array( "1", "2", "3", "5", "((1+", "2)+", "5)", "*3" );
Combinations[34] = new Array( "1", "2", "3", "6", "((1*", "2)+", "6)", "*3" );
Combinations[35] = new Array( "1", "2", "3", "7", "((1+", "2)*", "7)", "+3" );
Combinations[36] = new Array( "1", "2", "3", "8", "((1+", "3)+", "8)", "*2" );
Combinations[37] = new Array( "1", "2", "3", "9", "((1+", "2)*", "9)", "-3" );
Combinations[38] = new Array( "1", "2", "4", "4", "((1*", "2)+", "4)", "*4" );
Combinations[39] = new Array( "1", "2", "4", "5", "((2+", "5)-", "1)", "*4" );
Combinations[40] = new Array( "1", "2", "4", "6", "((2-", "1)*", "4)", "*6" );
Combinations[41] = new Array( "1", "2", "4", "7", "((1+", "4)+", "7)", "*2" );
Combinations[42] = new Array( "1", "2", "4", "8", "((1+", "4)-", "2)", "*8" );
Combinations[43] = new Array( "1", "2", "4", "9", "((1+", "9)*", "2)", "+4" );
Combinations[44] = new Array( "1", "2", "5", "5", "((5*", "5)+", "1)", "-2" );
Combinations[45] = new Array( "1", "2", "5", "6", "((1+", "5)+", "6)", "*2" );
Combinations[46] = new Array( "1", "2", "5", "7", "((1*", "5)+", "7)", "*2" );
Combinations[47] = new Array( "1", "2", "5", "8", "((1+", "5)*", "8)", "/2" );
Combinations[48] = new Array( "1", "2", "5", "9", "((1+", "2)*", "5)", "+9" );
Combinations[49] = new Array( "1", "2", "6", "6", "((1+", "2)*", "6)", "+6" );
Combinations[50] = new Array( "1", "2", "6", "7", "((1+", "7)*", "6)", "/2" );
Combinations[51] = new Array( "1", "2", "6", "8", "((1+", "8)*", "2)", "+6" );
Combinations[52] = new Array( "1", "2", "6", "9", "((1*", "2)*", "9)", "+6" );
Combinations[53] = new Array( "1", "2", "7", "7", "((7*", "7)-", "1)", "/2" );
Combinations[54] = new Array( "1", "2", "7", "8", "((1+", "7)*", "2)", "+8" );
Combinations[55] = new Array( "1", "2", "7", "9", "((2*", "7)+", "1)", "+9" );
Combinations[56] = new Array( "1", "2", "8", "8", "((1*", "2)*", "8)", "+8" );
Combinations[57] = new Array( "1", "2", "8", "9", "((2*", "8)+", "9)", "-1" );
Combinations[58] = new Array( "1", "3", "3", "3", "((3*", "3)-", "1)", "*3" );
Combinations[59] = new Array( "1", "3", "3", "4", "((1+", "3)+", "4)", "*3" );
Combinations[60] = new Array( "1", "3", "3", "5", "((1*", "3)+", "5)", "*3" );
Combinations[61] = new Array( "1", "3", "3", "6", "((1+", "6)*", "3)", "+3" );
Combinations[62] = new Array( "1", "3", "3", "7", "((1*", "3)*", "7)", "+3" );
Combinations[63] = new Array( "1", "3", "3", "8", "((1+", "8)*", "3)", "-3" );
Combinations[64] = new Array( "1", "3", "3", "9", "((1*", "3)*", "9)", "-3" );
Combinations[65] = new Array( "1", "3", "4", "4", "((1*", "4)+", "4)", "*3" );
Combinations[66] = new Array( "1", "3", "4", "5", "((1+", "3)*", "5)", "+4" );
Combinations[67] = new Array( "1", "3", "4", "6", "6/", "(1-", "(3", "/4))" );
Combinations[68] = new Array( "1", "3", "4", "7", "((1+", "3)*", "7)", "-4" );
Combinations[69] = new Array( "1", "3", "4", "8", "((1+", "3)*", "4)", "+8" );
Combinations[70] = new Array( "1", "3", "4", "9", "((1+", "4)*", "3)", "+9" );
Combinations[71] = new Array( "1", "3", "5", "6", "((1+", "5)*", "3)", "+6" );
Combinations[72] = new Array( "1", "3", "5", "7", "(1+", "5)*", "(7", "-3)" );
Combinations[73] = new Array( "1", "3", "5", "8", "((1+", "5)-", "3)", "*8" );
Combinations[74] = new Array( "1", "3", "5", "9", "((1*", "3)*", "5)", "+9" );
Combinations[75] = new Array( "1", "3", "6", "6", "((1+", "6)-", "3)", "*6" );
Combinations[76] = new Array( "1", "3", "6", "7", "((1*", "7)-", "3)", "*6" );
Combinations[77] = new Array( "1", "3", "6", "8", "((1*", "6)-", "-3)", "*8" );
Combinations[78] = new Array( "1", "3", "6", "9", "((1+", "9)*", "3)", "-6" );
Combinations[79] = new Array( "1", "3", "7", "7", "(1-", "7)*", "(3", "-7)" );
Combinations[80] = new Array( "1", "3", "7", "8", "((7-", "1)-", "3)", "*8" );
Combinations[81] = new Array( "1", "3", "7", "9", "((1+", "7)*", "9)", "/3" );
Combinations[82] = new Array( "1", "3", "8", "8", "((1+", "3)*", "8)", "-8" );
Combinations[83] = new Array( "1", "3", "8", "9", "((1*", "8)*", "9)", "/3" );
Combinations[84] = new Array( "1", "3", "9", "9", "((9-", "1)*", "9)", "/3" );
Combinations[85] = new Array( "1", "4", "4", "4", "((1+", "4)*", "4)", "+4" );
Combinations[86] = new Array( "1", "4", "4", "5", "((1*", "4)*", "5)", "+4" );
Combinations[87] = new Array( "1", "4", "4", "6", "((1+", "6)*", "4)", "-4" );
Combinations[88] = new Array( "1", "4", "4", "7", "((1*", "4)*", "7)", "-4" );
Combinations[89] = new Array( "1", "4", "4", "8", "((1*", "4)*", "4)", "+8" );
Combinations[90] = new Array( "1", "4", "4", "9", "((1+", "9)-", "4)", "*4" );
Combinations[91] = new Array( "1", "4", "5", "5", "((4*", "5)+", "5)", "-1" );
Combinations[92] = new Array( "1", "4", "5", "6", "6/", "((5/", "4", "-1)" );
Combinations[93] = new Array( "1", "4", "5", "7", "((4*", "7)+", "1)", "-5" );
Combinations[94] = new Array( "1", "4", "5", "8", "((5-", "1)*", "4)", "+8" );
Combinations[95] = new Array( "1", "4", "5", "9", "((4-", "1)*", "5)", "+9" );
Combinations[96] = new Array( "1", "4", "6", "6", "((1+", "4)*", "6)", "-6" );
Combinations[97] = new Array( "1", "4", "6", "7", "((1+", "7)", "-4)", "*6" );
Combinations[98] = new Array( "1", "4", "6", "8", "((1+", "6)-", "4)", "*8" );
Combinations[99] = new Array( "1", "4", "6", "9", "((9-", "1)-", "4)", "*6" );
Combinations[100] = new Array( "1", "4", "7", "7", "(1+", "7)*", "(7", "-4)" );
Combinations[101] = new Array( "1", "4", "7", "8", "((1+", "7)*", "4)", "-8" );
Combinations[102] = new Array( "1", "4", "7", "9", "(1-", "9)*", "(4", "-7)" );
Combinations[103] = new Array( "1", "4", "8", "8", "((1*", "4)*", "8)", "-8" );
Combinations[104] = new Array( "1", "4", "8", "9", "((4*", "8)+", "1)", "-9" );
Combinations[105] = new Array( "1", "5", "5", "6", "((1+", "5)*", "5)", "-6" );
Combinations[106] = new Array( "1", "5", "5", "9", "(1+", "5)*(", "9", "-5)" );
Combinations[107] = new Array( "1", "5", "6", "6", "((1*", "5)*", "6)", "-6" );
Combinations[108] = new Array( "1", "5", "6", "7", "((5*", "6)+", "1)", "-7" );
Combinations[109] = new Array( "1", "5", "6", "8", "((1+", "8)-", "5)", "*6" );
Combinations[110] = new Array( "1", "5", "6", "9", "((1*", "9)-", "5)", "*6" );
Combinations[111] = new Array( "1", "5", "7", "8", "((1+", "7)-", "5)", "*8" );
Combinations[112] = new Array( "1", "5", "7", "9", "(1-", "7)*", "(5", "-9)" );
Combinations[113] = new Array( "1", "5", "8", "8", "((1*", "8)-", "5)", "*8" );
Combinations[114] = new Array( "1", "5", "8", "9", "((9-", "1)-", "5)", "*8" );
Combinations[115] = new Array( "1", "5", "9", "9", "((1+", "5)+", "9)", "+9" );
Combinations[116] = new Array( "1", "6", "6", "6", "((6-", "1)*", "6)", "-6" );
Combinations[117] = new Array( "1", "6", "6", "8", "6/", "(1-", "(6", "/8))" );
Combinations[118] = new Array( "1", "6", "6", "9", "((1+", "9)-", "6)", "*6" );
Combinations[119] = new Array( "1", "6", "7", "9", "(1+", "7)*", "(9", "-6)" );
Combinations[120] = new Array( "1", "6", "8", "8", "((1+", "8)-", "6)", "*8" );
Combinations[121] = new Array( "1", "6", "8", "9", "((1+", "6)+", "8)", "+9" );
Combinations[122] = new Array( "1", "6", "9", "9", "((1*", "6)+", "9)", "+9" );
Combinations[123] = new Array( "1", "7", "7", "9", "((1+", "7)+", "7)", "+9" );
Combinations[124] = new Array( "1", "7", "8", "8", "((1+", "7)+", "8)", "+8" );
Combinations[125] = new Array( "1", "7", "8", "9", "((1+", "9)-", "7)", "*8" );
Combinations[126] = new Array( "1", "7", "9", "9", "((7+", "9)+", "9)", "-1" );
Combinations[127] = new Array( "1", "8", "8", "8", "((1*", "8)+", "8)", "+8" );
Combinations[128] = new Array( "1", "8", "8", "9", "((8+", "8)+", "9)", "-1" );
Combinations[129] = new Array( "2", "2", "2", "3", "((2+", "2)*", "2)", "*3" );
Combinations[130] = new Array( "2", "2", "2", "4", "((2+", "2)+", "2)", "*4" );
Combinations[131] = new Array( "2", "2", "2", "5", "((2*", "5)+", "2)", "*2" );
Combinations[132] = new Array( "2", "2", "2", "7", "((2*", "7)-", "2)", "*2" );
Combinations[133] = new Array( "2", "2", "2", "8", "((2+", "2)+", "8)", "*2" );
Combinations[134] = new Array( "2", "2", "2", "9", "((2+", "9)*", "2)", "+2" );
Combinations[135] = new Array( "2", "2", "3", "3", "((2*", "3)+", "2)", "*3" );
Combinations[136] = new Array( "2", "2", "3", "4", "((2+", "2)+", "4)", "*3" );
Combinations[137] = new Array( "2", "2", "3", "5", "((2*", "5)-", "2)", "*3" );
Combinations[138] = new Array( "2", "2", "3", "6", "((2*", "3)+", "6)", "*2" );
Combinations[139] = new Array( "2", "2", "3", "7", "((2+", "3)+", "7)", "*2" );
Combinations[140] = new Array( "2", "2", "3", "8", "((2+", "3)-", "2)", "*8" );
Combinations[141] = new Array( "2", "2", "3", "9", "((2/", "3)+", "2)", "*9" );
Combinations[142] = new Array( "2", "2", "4", "4", "((2*", "4)+", "4)", "*2" );
Combinations[143] = new Array( "2", "2", "4", "5", "((2+", "2)*", "5)", "+4" );
Combinations[144] = new Array( "2", "2", "4", "6", "((2+", "4)+", "6)", "*2" );
Combinations[145] = new Array( "2", "2", "4", "7", "((2+", "2)*", "7)", "-4" );
Combinations[146] = new Array( "2", "2", "4", "8", "((2+", "2)*", "4)", "+8" );
Combinations[147] = new Array( "2", "2", "4", "9", "((2*", "9)+", "2)", "+4" );
Combinations[148] = new Array( "2", "2", "5", "5", "((2+", "5)+", "5)", "*2" );
Combinations[149] = new Array( "2", "2", "5", "6", "((5+", "6)*", "2)", "+2" );
Combinations[150] = new Array( "2", "2", "5", "7", "(2*", "5)+", "(2", "*7)" );
Combinations[151] = new Array( "2", "2", "5", "8", "((5+", "8)*", "2)", "-2" );
Combinations[152] = new Array( "2", "2", "5", "9", "((5+", "9)-", "2)", "*2" );
Combinations[153] = new Array( "2", "2", "6", "6", "((2+", "6)*", "6)", "/2" );
Combinations[154] = new Array( "2", "2", "6", "7", "((2+", "7)*", "2)", "+6" );
Combinations[155] = new Array( "2", "2", "6", "8", "((2+", "6)*", "*2)", "+8" );
Combinations[156] = new Array( "2", "2", "6", "9", "((2*", "9)-", "6)", "*2" );
Combinations[157] = new Array( "2", "2", "7", "7", "((7+", "7)-", "2)", "*2" );
Combinations[158] = new Array( "2", "2", "7", "8", "((2*", "7)+", "2)", "+8" );
Combinations[159] = new Array( "2", "2", "8", "8", "((2+", "2)*", "8)", "-8" );
Combinations[160] = new Array( "2", "2", "8", "9", "((2*", "9)+", "8)", "-2" );
Combinations[161] = new Array( "2", "3", "3", "3", "((2+", "3)+", "3)", "*3" );
Combinations[162] = new Array( "2", "3", "3", "5", "((2+", "5)*", "3)", "+3" );
Combinations[163] = new Array( "2", "3", "3", "6", "((2*", "3)*", "3)", "+6" );
Combinations[164] = new Array( "2", "3", "3", "7", "((2+", "7)*", "3)", "-3" );
Combinations[165] = new Array( "2", "3", "3", "8", "((2*", "3)-", "3)", "*8" );
Combinations[166] = new Array( "2", "3", "3", "9", "((2+", "3)*", "3)", "+9" );
Combinations[167] = new Array( "2", "3", "4", "4", "((2+", "3)*", "4)", "+4" );
Combinations[168] = new Array( "2", "3", "4", "5", "((3+", "4)+", "5)", "*2" );
Combinations[169] = new Array( "2", "3", "4", "6", "((2+", "4)*", "3)", "+6" );
Combinations[170] = new Array( "2", "3", "4", "7", "((2+", "7)-", "3)", "*4" );
Combinations[171] = new Array( "2", "3", "4", "8", "((2+", "4)-", "3)", "*8" );
Combinations[172] = new Array( "2", "3", "4", "9", "((2*", "4)*", "9)", "/3" );
Combinations[173] = new Array( "2", "3", "5", "5", "((5+", "5)-", "2)", "*3" );
Combinations[174] = new Array( "2", "3", "5", "6", "((2+", "5)-", "3)", "*6" );
Combinations[175] = new Array( "2", "3", "5", "7", "((3*", "5)+", "2)", "+7" );
Combinations[176] = new Array( "2", "3", "5", "8", "((2*", "8)+", "3)", "+5" );
Combinations[177] = new Array( "2", "3", "5", "9", "((3*", "9)+", "2)", "-5" );
Combinations[178] = new Array( "2", "3", "6", "6", "((2+", "3)*", "6)", "-6" );
Combinations[179] = new Array( "2", "3", "6", "7", "((2*", "7)-", "6)", "*3" );
Combinations[180] = new Array( "2", "3", "6", "8", "((2+", "8)*", "3)", "-6" );
Combinations[181] = new Array( "2", "3", "6", "9", "((2+", "6)*", "9)", "/3" );
Combinations[182] = new Array( "2", "3", "7", "7", "((2*", "7)+", "3)", "+7" );
Combinations[183] = new Array( "2", "3", "7", "8", "((2+", "7)*", "8)", "/3" );
Combinations[184] = new Array( "2", "3", "7", "9", "((3*", "7)-", "9)", "*2" );
Combinations[185] = new Array( "2", "3", "8", "8", "((2*", "8)-", "8)", "*3" );
Combinations[186] = new Array( "2", "3", "8", "9", "((9-", "3)*", "8)", "/2" );
Combinations[187] = new Array( "2", "3", "9", "9", "((2+", "9)*", "3)", "-9" );
Combinations[188] = new Array( "2", "4", "4", "4", "((4+", "4)+", "4)", "*2" );
Combinations[189] = new Array( "2", "4", "4", "5", "((2+", "5)*", "4)", "-4" );
Combinations[190] = new Array( "2", "4", "4", "6", "((2*", "4)-", "4)", "*6" );
Combinations[191] = new Array( "2", "4", "4", "7", "((7-", "2)*", "4)", "+4" );
Combinations[192] = new Array( "2", "4", "4", "8", "((2+", "8)-", "4)", "*4" );
Combinations[193] = new Array( "2", "4", "4", "9", "((9-", "2)*", "4)", "-4" );
Combinations[194] = new Array( "2", "4", "5", "5", "((5+", "5)*", "2)", "+4" );
Combinations[195] = new Array( "2", "4", "5", "6", "((2+", "4)*", "5)", "-6" );
Combinations[196] = new Array( "2", "4", "5", "7", "((5+", "7)*", "4)", "/2" );
Combinations[197] = new Array( "2", "4", "5", "8", "((2+", "5)-", "4)", "*8" );
Combinations[198] = new Array( "2", "4", "5", "9", "((2+", "9)-", "5)", "*4" );
Combinations[199] = new Array( "2", "4", "6", "6", "((2+", "6)-", "4)", "*6" );
Combinations[200] = new Array( "2", "4", "6", "7", "((2*", "7)+", "4)", "+6" );
Combinations[201] = new Array( "2", "4", "6", "8", "((2+", "6)*", "4)", "-8" );
Combinations[202] = new Array( "2", "4", "6", "9", "((4-", "2)*", "9)", "+6" );
Combinations[203] = new Array( "2", "4", "7", "7", "((7+", "7)*", "2)", "-4" );
Combinations[204] = new Array( "2", "4", "7", "8", "((2*", "7)-", "8)", "*4" );
Combinations[205] = new Array( "2", "4", "7", "9", "((2*", "4)+", "7)", "+9" );
Combinations[206] = new Array( "2", "4", "8", "8", "((2*", "4)+", "8)", "+8" );
Combinations[207] = new Array( "2", "4", "8", "9", "((9-", "2)-", "4)", "*8" );
Combinations[208] = new Array( "2", "4", "9", "9", "((2+", "4)+", "9)", "+9" );
Combinations[209] = new Array( "2", "5", "5", "7", "((2*", "7)+", "5)", "+5" );
Combinations[210] = new Array( "2", "5", "5", "8", "((5/", "5)+", "2)", "*8" );
Combinations[211] = new Array( "2", "5", "5", "9", "((2*", "5)+", "5)", "+9" );
Combinations[212] = new Array( "2", "5", "6", "6", "((2*", "5)-", "6)", "*6" );
Combinations[213] = new Array( "2", "5", "6", "7", "((2+", "7)-", "5)", "*6" );
Combinations[214] = new Array( "2", "5", "6", "8", "((2+", "6)-", "5)", "*8" );
Combinations[215] = new Array( "2", "5", "6", "9", "((5*", "6)/", "2)", "+9" );
Combinations[216] = new Array( "2", "5", "7", "7", "((2*", "5)+", "7)", "+7" );
Combinations[217] = new Array( "2", "5", "7", "8", "((2*", "5)-", "7)", "*8" );
Combinations[218] = new Array( "2", "5", "7", "9", "((5*", "7)-", "2)", "-9" );
Combinations[219] = new Array( "2", "5", "8", "8", "((5*", "8)+", "8)", "/2" );
Combinations[220] = new Array( "2", "5", "8", "9", "((2+", "5)+", "8)", "+9" );
Combinations[221] = new Array( "2", "6", "6", "6", "((2*", "6)+", "6)", "+6" );
Combinations[222] = new Array( "2", "6", "6", "7", "((6*", "7)+", "6)", "/2" );
Combinations[223] = new Array( "2", "6", "6", "8", "((2+", "8)-", "6)", "*6" );
Combinations[224] = new Array( "2", "6", "6", "9", "((6+", "9)*", "2)", "-6" );
Combinations[225] = new Array( "2", "6", "7", "8", "((2+", "7)-", "6)", "*8" );
Combinations[226] = new Array( "2", "6", "7", "9", "((2+", "6)+", "7)", "+9" );
Combinations[227] = new Array( "2", "6", "8", "8", "((2+", "6)+", "8)", "+8" );
Combinations[228] = new Array( "2", "6", "8", "9", "((2*", "6)-", "9)", "*8" );
Combinations[229] = new Array( "2", "6", "9", "9", "((6/", "9)+", "2)", "*9" );
Combinations[230] = new Array( "2", "7", "7", "8", "((2+", "7)+", "7)", "+8" );
Combinations[231] = new Array( "2", "7", "8", "8", "((2+", "8)-", "7)", "*8" );
Combinations[232] = new Array( "2", "7", "8", "9", "((7+", "9)*", "2)", "-8" );
Combinations[233] = new Array( "2", "8", "8", "8", "((8+", "8)*", "2)", "-8" );
Combinations[234] = new Array( "2", "8", "8", "9", "((2+", "9)-", "8)", "*8" );
Combinations[235] = new Array( "2", "8", "9", "9", "((8+", "9)+", "9)", "-2" );
Combinations[236] = new Array( "3", "3", "3", "3", "((3*", "3)*", "3)", "-3" );
Combinations[237] = new Array( "3", "3", "3", "4", "((3+", "4)*", "3)", "+3" );
Combinations[238] = new Array( "3", "3", "3", "5", "(3*", "3)+(", "3", "*5)" );
Combinations[239] = new Array( "3", "3", "3", "6", "((3+", "3)*", "3)", "+6" );
Combinations[240] = new Array( "3", "3", "3", "7", "((3/", "3)+", "7)", "*3" );
Combinations[241] = new Array( "3", "3", "3", "8", "((3+", "3)-", "3)", "*8" );
Combinations[242] = new Array( "3", "3", "3", "9", "(9-", "(3/3", "))", "*3" );
Combinations[243] = new Array( "3", "3", "4", "4", "((3*", "4)-", "4)", "*3" );
Combinations[244] = new Array( "3", "3", "4", "5", "((3/", "3)+", "5)", "*4" );
Combinations[245] = new Array( "3", "3", "4", "6", "((3+", "4)-", "3)", "*6" );
Combinations[246] = new Array( "3", "3", "4", "7", "((4+", "7)-", "3)", "*3" );
Combinations[247] = new Array( "3", "3", "4", "8", "((4-", "3)*", "3)", "*8" );
Combinations[248] = new Array( "3", "3", "4", "9", "((3+", "9)-", "4)", "*3" );
Combinations[249] = new Array( "3", "3", "5", "5", "(5*", "5)-(", "3", "/3)" );
Combinations[250] = new Array( "3", "3", "5", "6", "((3+", "3)*", "5)", "-6" );
Combinations[251] = new Array( "3", "3", "5", "7", "((3*", "5)-", "7)", "*3" );
Combinations[252] = new Array( "3", "3", "5", "9", "((3+", "5)*", "9)", "/3" );
Combinations[253] = new Array( "3", "3", "6", "6", "((6/", "3)+", "6)", "*3" );
Combinations[254] = new Array( "3", "3", "6", "7", "((3+", "7)*", "3)", "-6" );
Combinations[255] = new Array( "3", "3", "6", "8", "((3+", "6)*", "8)", "/3" );
Combinations[256] = new Array( "3", "3", "6", "9", "((3+", "9)*", "6)", "/3" );
Combinations[257] = new Array( "3", "3", "7", "7", "((3/", "7)+", "3)", "*7" );
Combinations[258] = new Array( "3", "3", "7", "8", "((3*", "3)+", "7)", "+8" );
Combinations[259] = new Array( "3", "3", "7", "9", "((7*", "9)/", "3)", "+3" );
Combinations[260] = new Array( "3", "3", "8", "9", "((3+", "8)*", "3)", "-9" );
Combinations[261] = new Array( "3", "3", "9", "9", "((3+", "3)+", "9)", "+9" );
Combinations[262] = new Array( "3", "4", "4", "4", "((3+", "4)*", "4)", "-4" );
Combinations[263] = new Array( "3", "4", "4", "5", "((4+", "5)-", "3)", "*4" );
Combinations[264] = new Array( "3", "4", "4", "6", "((3*", "4)-", "6)", "*4" );
Combinations[265] = new Array( "3", "4", "4", "7", "((3+", "7)-", "4)", "*4" );
Combinations[266] = new Array( "3", "4", "4", "8", "((3+", "4)-", "4)", "*8" );
Combinations[267] = new Array( "3", "4", "4", "9", "((4+", "4)*", "9)", "/3" );
Combinations[268] = new Array( "3", "4", "5", "5", "((3*", "5)+", "4)", "+5" );
Combinations[269] = new Array( "3", "4", "5", "6", "((3+", "5)-", "4)", "*6" );
Combinations[270] = new Array( "3", "4", "5", "7", "((3*", "4)+", "5)", "+7" );
Combinations[271] = new Array( "3", "4", "5", "9", "((9-", "(5-", "4))", "*3" );//FIXED
Combinations[272] = new Array( "3", "4", "6", "6", "((3*", "4)+", "6)", "+6" );//FIXED
//Combinations[273] = new Array( "3", "4", "6", "7", "((3*", "4)+", "6)", "+6" );//FIXED
Combinations[274] = new Array( "3", "4", "6", "8", "((3*", "4)-", "8)", "*6" );
Combinations[275] = new Array( "3", "4", "6", "9", "((3+", "9)-", "6)", "*4" );
Combinations[276] = new Array( "3", "4", "7", "7", "((3*", "7)+", "7)", "-4" );
Combinations[277] = new Array( "3", "4", "7", "8", "((7-", "3)*", "4)", "+8" );
Combinations[278] = new Array( "3", "4", "7", "9", "((3*", "9)+", "4)", "-7" );
Combinations[279] = new Array( "3", "4", "8", "9", "((3+", "4)+", "8)", "+9" );
Combinations[280] = new Array( "3", "4", "9", "9", "((4*", "9)-", "3)", "-9" );
Combinations[281] = new Array( "3", "5", "5", "6", "((5+", "5)*", "3)", "-6" );
Combinations[282] = new Array( "3", "5", "5", "7", "((5/", "5)+", "7)", "*3" );
Combinations[283] = new Array( "3", "5", "5", "8", "((3+", "5)-", "5)", "*8" );
Combinations[284] = new Array( "3", "5", "5", "9", "(9-", "(5/5", "))", "*3" );
Combinations[285] = new Array( "3", "5", "6", "6", "((3+", "6)-", "5)", "*6" );
Combinations[286] = new Array( "3", "5", "6", "7", "((5+", "7)*", "6)", "/3" );
Combinations[287] = new Array( "3", "5", "6", "8", "((6-", "5)*", "3)", "*8" );
Combinations[288] = new Array( "3", "5", "6", "9", "((5+", "6)*", "3)", "-9" );
Combinations[289] = new Array( "3", "5", "7", "8", "((3*", "7)+", "8)", "-5" );
Combinations[290] = new Array( "3", "5", "7", "9", "((3+", "5)+", "7)", "+9" );
Combinations[291] = new Array( "3", "5", "8", "8", "((3+", "5)+", "8)", "+8" );
Combinations[292] = new Array( "3", "5", "8", "9", "((3*", "9)+", "5)", "-8" );
Combinations[293] = new Array( "3", "5", "9", "9", "((5*", "9)/", "3)", "+9" );
Combinations[294] = new Array( "3", "6", "6", "6", "((6+", "6)*", "6)", "/3" );
Combinations[295] = new Array( "3", "6", "6", "7", "((3+", "7)-", "6)", "*6" );
Combinations[296] = new Array( "3", "6", "6", "8", "((3+", "6)-", "6)", "*8" );
Combinations[297] = new Array( "3", "6", "6", "9", "((3+", "6)+", "6)", "+9" );
Combinations[298] = new Array( "3", "6", "7", "7", "((7+", "7)-", "6)", "*3" );
Combinations[299] = new Array( "3", "6", "7", "8", "((3+", "6)+", "7)", "+8" );
Combinations[300] = new Array( "3", "6", "7", "9", "((3*", "7)+", "9)", "-6" );
Combinations[301] = new Array( "3", "6", "8", "8", "((6*", "8)/", "3)", "+8" );
Combinations[302] = new Array( "3", "6", "8", "9", "((3+", "9)-", "8)", "*6" );
Combinations[303] = new Array( "3", "6", "9", "9", "((3*", "9)+", "6)", "-9" );
Combinations[304] = new Array( "3", "7", "7", "7", "((3+", "7)+", "7)", "+7" );
Combinations[305] = new Array( "3", "7", "7", "8", "((3+", "7)-", "7)", "*8" );
Combinations[306] = new Array( "3", "7", "7", "9", "(9-", "(7/7", "))", "*3" );
Combinations[307] = new Array( "3", "7", "8", "8", "((7-", "3)*", "8)", "-8" );
Combinations[308] = new Array( "3", "7", "8", "9", "((7+", "9)-", "8)", "*3" );
Combinations[309] = new Array( "3", "7", "9", "9", "((7*", "9)+", "9)", "/3" );
Combinations[310] = new Array( "3", "8", "8", "8", "((3+", "8)-", "8)", "*8" );
Combinations[311] = new Array( "3", "8", "8", "9", "((9-", "8)*", "3)", "*8" );
Combinations[312] = new Array( "3", "8", "9", "9", "((3+", "9)-", "9)", "*8" );
Combinations[313] = new Array( "3", "9", "9", "9", "((9+", "9)+", "9)", "-3" );
Combinations[314] = new Array( "4", "4", "4", "4", "((4*", "4)+", "4)", "+4" );
Combinations[315] = new Array( "4", "4", "4", "5", "((4/", "4)+", "5)", "*4" );
Combinations[316] = new Array( "4", "4", "4", "6", "((4+", "4)-", "4)", "*6" );
Combinations[317] = new Array( "4", "4", "4", "7", "(4+", "4)*(", "7", "-4)" );
Combinations[318] = new Array( "4", "4", "4", "8", "((4+", "4)*", "4)", "-8" );
Combinations[319] = new Array( "4", "4", "4", "9", "((9-", "4)*", "4)", "+4" );
Combinations[320] = new Array( "4", "4", "5", "5", "((5+", "5)-", "4)", "*4" );
Combinations[321] = new Array( "4", "4", "5", "6", "((5-", "4)*", "4)", "*6" );
Combinations[322] = new Array( "4", "4", "5", "7", "((4+", "7)-", "5)", "*4" );
Combinations[323] = new Array( "4", "4", "5", "8", "((4+", "4)-", "5)", "*8" );
Combinations[324] = new Array( "4", "4", "6", "8", "((4+", "8)-", "6)", "*4" );
Combinations[325] = new Array( "4", "4", "6", "9", "((4*", "4)*", "9)", "/6" );
Combinations[326] = new Array( "4", "4", "7", "7", "(4-", "(4/7", "))", "*7" );
Combinations[327] = new Array( "4", "4", "7", "8", "((4*", "7)+", "4)", "-8" );
Combinations[328] = new Array( "4", "4", "7", "9", "((4+", "4)+", "7)", "+9" );
Combinations[329] = new Array( "4", "4", "8", "8", "((4+", "4)+", "8)", "+8" );
Combinations[330] = new Array( "4", "4", "8", "9", "((4*", "9)-", "4)", "-8" );
Combinations[331] = new Array( "4", "5", "5", "5", "((5*", "5)+", "4)", "-5" );
Combinations[332] = new Array( "4", "5", "5", "6", "((4+", "5)-", "5)", "*6" );
Combinations[333] = new Array( "4", "5", "5", "7", "(7-", "(5/5", "))", "*4" );
Combinations[334] = new Array( "4", "5", "5", "8", "(4-", "(5/5", "))", "*8" );
Combinations[335] = new Array( "4", "5", "5", "9", "((4*", "5)+", "9)", "-5" );
Combinations[336] = new Array( "4", "5", "6", "6", "((6-", "5)*", "4)", "*6" );
Combinations[337] = new Array( "4", "5", "6", "7", "((5+", "7)-", "6)", "*4" );
Combinations[338] = new Array( "4", "5", "6", "8", "((4+", "5)-", "6)", "*8" );
Combinations[339] = new Array( "4", "5", "6", "9", "((4+", "5)+", "6)", "+9" );
Combinations[340] = new Array( "4", "5", "7", "7", "((5*", "7)-", "4)", "-7" );
Combinations[341] = new Array( "4", "5", "7", "8", "((4+", "5)+", "7)", "+8" );
Combinations[342] = new Array( "4", "5", "7", "9", "((4*", "7)+", "5)", "-9" );
Combinations[343] = new Array( "4", "5", "8", "8", "((8/", "8)+", "5)", "*4" );
Combinations[344] = new Array( "4", "5", "8", "9", "((5+", "9)-", "8)", "*4" );
Combinations[345] = new Array( "4", "5", "9", "9", "((9/", "9)+", "5)", "*4" );
Combinations[346] = new Array( "4", "6", "6", "6", "((4+", "6)-", "6)", "*6" );
Combinations[347] = new Array( "4", "6", "6", "7", "((7-", "4)*", "6)", "+6" );
Combinations[348] = new Array( "4", "6", "6", "8", "((4+", "6)+", "6)", "+8" );
Combinations[349] = new Array( "4", "6", "6", "9", "((4*", "9)-", "6)", "-6" );
Combinations[350] = new Array( "4", "6", "7", "7", "((4+", "6)+", "7)", "+7" );
Combinations[351] = new Array( "4", "6", "7", "8", "((4+", "6)-", "7)", "*8" );
Combinations[352] = new Array( "4", "6", "7", "9", "((7+", "9)*", "6)", "/4" );
Combinations[353] = new Array( "4", "6", "8", "8", "((4+", "8)-", "8)", "*6" );
Combinations[354] = new Array( "4", "6", "8", "9", "((8*", "9)/", "4)", "+6" );
Combinations[355] = new Array( "4", "6", "9", "9", "((4+", "9)-", "9)", "*6" );
Combinations[356] = new Array( "4", "7", "7", "7", "(7-", "(7/7", "))", "*4" );
Combinations[357] = new Array( "4", "7", "7", "8", "((7+", "7)-", "8)", "*4" );
Combinations[358] = new Array( "4", "7", "8", "8", "((4+", "7)-", "8)", "*8" );
Combinations[359] = new Array( "4", "7", "8", "9", "((7+", "8)-", "9)", "*4" );
Combinations[360] = new Array( "4", "7", "9", "9", "(7-", "(9/9", "))", "*4" );
Combinations[361] = new Array( "4", "8", "8", "8", "((8-", "4)*", "8)", "-8" );
Combinations[362] = new Array( "4", "8", "8", "9", "((4+", "8)-", "9)", "*8" );
Combinations[363] = new Array( "4", "8", "9", "8", "((4-", "(9-", "8))", "*8" );//FIXED
Combinations[364] = new Array( "5", "5", "5", "5", "(5*", "5)-(", "5", "/5)" );
Combinations[365] = new Array( "5", "5", "5", "6", "((5*", "5)+", "5)", "-6" );
Combinations[366] = new Array( "5", "5", "5", "9", "((5+", "5)+", "5)", "+9" );
Combinations[367] = new Array( "5", "5", "6", "6", "((5+", "5)-", "6)", "*6" );
Combinations[368] = new Array( "5", "5", "6", "7", "((5*", "5)+", "6)", "-7" );
Combinations[369] = new Array( "5", "5", "6", "8", "((5+", "5)+", "6)", "+8" );
Combinations[370] = new Array( "5", "5", "7", "7", "((5+", "5)+", "7)", "+7" );
Combinations[371] = new Array( "5", "5", "7", "8", "((5+", "5)-", "7)", "*8" );
Combinations[372] = new Array( "5", "5", "8", "8", "(5*", "5)-(", "8", "/8)" );
Combinations[373] = new Array( "5", "5", "8", "9", "((5*", "5)+", "8)", "-9" );
Combinations[374] = new Array( "5", "5", "9", "9", "(5*", "5)-(", "9", "/9)" );
Combinations[375] = new Array( "5", "6", "6", "6", "(5-", "(6/", "6))", "*6" );
Combinations[376] = new Array( "5", "6", "6", "7", "((5+", "6)+", "6)", "+7" );
Combinations[377] = new Array( "5", "6", "6", "8", "((8-", "5)*", "6)", "+6" );
Combinations[378] = new Array( "5", "6", "6", "9", "(6*", "9)-(", "5", "*6)" );
Combinations[379] = new Array( "5", "6", "7", "7", "(5-", "(7/", "7))", "*6" );
Combinations[380] = new Array( "5", "6", "7", "8", "((5+", "7)-", "8)", "*6" );
Combinations[381] = new Array( "5", "6", "7", "9", "((7-", "5)*", "9)", "+6" );
Combinations[382] = new Array( "5", "6", "8", "8", "((5+", "6)-", "8)", "*8" );
Combinations[383] = new Array( "5", "6", "8", "9", "((5+", "8)-", "9)", "*6" );
Combinations[384] = new Array( "5", "6", "9", "9", "((9-", "6)*", "5)", "+9" );
Combinations[385] = new Array( "5", "7", "7", "9", "(5+", "7)*(", "9", "-7)" );
Combinations[386] = new Array( "5", "7", "8", "8", "((7+", "8)*", "8)", "/5" );
Combinations[387] = new Array( "5", "7", "8", "9", "((5+", "7)-", "9)", "*8" );
Combinations[388] = new Array( "5", "8", "8", "8", "((5*", "8)-", "8)", "-8" );
Combinations[389] = new Array( "5", "8", "8", "9", "((9-", "5)*", "8)", "-8" );
Combinations[390] = new Array( "6", "6", "6", "6", "((6+", "6)+", "6)", "+6" );
Combinations[391] = new Array( "6", "6", "6", "8", "((6+", "6)-", "8)", "*6" );
Combinations[392] = new Array( "6", "6", "6", "9", "((6*", "6)*", "6)", "/9" );
Combinations[393] = new Array( "6", "6", "7", "9", "((6+", "7)-", "9)", "*6" );
Combinations[394] = new Array( "6", "6", "8", "8", "(6*", "8)/(", "8", "-6)" );
Combinations[395] = new Array( "6", "6", "8", "9", "((6+", "6)-", "9)", "*8" );
Combinations[396] = new Array( "6", "7", "8", "9", "(6*", "8)/(", "9", "-7)" );
Combinations[397] = new Array( "6", "7", "9", "9", "((6*", "7)-", "9)", "-9" );
Combinations[398] = new Array( "6", "8", "8", "8", "((8-", "6)*", "8)", "+8" );
Combinations[399] = new Array( "6", "8", "8", "9", "((8+", "8)*", "9)", "/6" );
Combinations[400] = new Array( "6", "8", "9", "9", "((9+", "9)*", "8)", "/6" );
Combinations[401] = new Array( "7", "8", "8", "9", "((9-", "7)*", "8)", "+8" );
//End Long Ass Array

//Button Object
function Button(xL, xR, yT, yB) {
	this.xLeft = xL;
	this.xRight = xR;
	this.yTop = yT;
	this.yBottom = yB;
}
//Backspace Button
var btnBs = new Button(274, 320, 34, 98);

//Instructions Page Play Button
var btnInstructionsPlay  = new Button(0, 320, 0, 430);

//Splash Page buttons
var btnPlay = new Button(57, 317, 100, 369);
var btnInstructions = new Button(0, 320, 370, 430);

//Point Buttons
var btnTopPoint = new Button(3, 57, 112, 181);
var btnMidPoint = new Button(3, 57, 212, 271);
var btnBottomPoint = new Button(3, 57, 302, 361);

//Grid Buttons
var btnGridTopLeft = new Button(57, 187, 100, 234.5);
var btnGridTopRight = new Button(187, 317, 100, 234.5);
var btnGridBottomLeft = new Button(57, 187, 234.5, 369);
var btnGridBottomRight = new Button(187, 317, 234.5, 369);

//Expression Buttons
var btnAddition = new Button(5, 61, 370, 430);
var btnSubtraction = new Button(67, 123, 370, 430);
var btnMultiplication = new Button(128, 184, 370, 430);
var btnDivision = new Button(189, 245, 370, 430);
var btnLeftParen = new Button(250, 279, 370, 430);
var btnRightParen = new Button(284, 313, 370, 430);

//Incorrect Answer Buttons
var btnSkipYes = new Button(77.33, 152.33, 175, 225);
var btnSkipNo = new Button(167.66, 242.66, 175, 225);

//Exit Button
var btnQuit = new Button(0, 30, 0, 34);

//Skip Button
var btnSkip = new Button(235, 320, 0, 34);

//Exits Game / cashes out gratti
function quitGame() {
 //add exit logic
 	exitGame();
}


function skipDisplay() {
	ctxAnimation.clearRect(0, 0, 320, 430);
	ctxAnimation.fillStyle = '#25BE13';
	ctxAnimation.textAlign = 'center';
	ctxAnimation.font = "80px Arial";
	if (skipDisplayCounter > 4) {
		ctxAnimation.font = "60px Arial";
		ctxAnimation.fillStyle = 'blue';
		ctxAnimation.clearRect(0, 0, 320, 430);
		ctxAnimation.fillText('Solution:', 160, 220);
	}
	else if (skipDisplayCounter > -1 && skipDisplayCounter <= 4) {
		ctxAnimation.font = "60px Arial";
		ctxAnimation.fillStyle = 'blue';
		ctxAnimation.clearRect(0, 0, 320, 430);
		ctxAnimation.fillText(Combinations[cardCombo][4] + Combinations[cardCombo][5] + Combinations[cardCombo][6] + Combinations[cardCombo][7], 160, 220);
	}
	else if (skipDisplayCounter == -1) {
		ctxAnimation.clearRect(0, 0, 320, 430);
		stopDrawingSkipDisplay();
		preRoundStart();
	}
	skipDisplayCounter--;
}
function drawSkipDisplay() {
	skipDisplay();
}
function startDrawingSkipDisplay() {
	stopDrawingSkipDisplay();
	drawIntervalSkipDisplay = setInterval(drawSkipDisplay, fps);
}
function stopDrawingSkipDisplay() {
	clearInterval(drawIntervalSkipDisplay);
}


//Functions for controling displaying round start timer and displaying calculation
function threeSec() {
	ctxAnimation.clearRect(0, 0, 320, 430);
	ctxAnimation.fillStyle = '#25BE13';
	ctxAnimation.textAlign = 'center';
	ctxAnimation.font = "80px Arial";
	if (expression != '' && threeSecCounter == 8) {
	ctxNumGrid.clearRect(0, 0, 320, 430);
	ctxGrid.clearRect(0, 0, 320, 430);
	ctxGrid.drawImage(grid, 0, 0, 260, 269, 57, 100, 260, 269);
	}
	if (expression != '' && threeSecCounter > 4) {
	//itemized score
	ctxAnimation.font = "80px Arial";
		ctxAnimation.fillStyle = '#25BE13';
		ctxAnimation.fillText(Math.round(eval(expression)*100)/100, 195, 210); //cuts off to two decimal points
		ctxAnimation.font = "20px Arial";
		ctxAnimation.fillStyle = '#413839';

		//For score display
		var timeRemainingScore = (1-((tempCounter/60)*0.01)).toFixed(2);
		var pointUsageScore = ((3-tempPointUsage)*0.01);
		var totalGratiiScore = ( parseFloat(timeRemainingScore) + parseFloat(pointUsageScore) ).toFixed(2);
		if (totalGratiiScore < 0.07) {
			totalGratiiScore = 0.07;
		}

		ctxAnimation.textAlign = 'left';
		ctxAnimation.fillText('Time Bonus: ' + Math.round(timeRemainingScore*100), 120, 260);
		ctxAnimation.fillText('Hint Bonus: ' + Math.round(pointUsageScore*100), 120, 300);
		ctxAnimation.fillText('Total: ' + Math.round(totalGratiiScore*100), 120, 340);

		/*ctxAnimation.fillText('Completion:', 150, 260);
		ctxAnimation.fillText('+5', 230, 260);
		ctxAnimation.fillText('Time Bonus:', 150, 300);
		ctxAnimation.fillText('+' + tempGratii, 230, 300);
		ctxAnimation.moveTo(90, 315);
		ctxAnimation.lineTo(275, 315);
		ctxAnimation.stroke();
		ctxAnimation.fillText('Total:', 150, 340);
		ctxAnimation.fillText('+' + (5 + tempGratii), 230, 340);
		ctxAnimation.drawImage(gratiiCoin, 0, 0, 50, 50, 250, 320, 25, 25);*/

	}
	if (threeSecCounter == 4) {
		ctxTime.clearRect(0, 0, 320, 430);
		ctxTime.drawImage(timerBlue, 0, 0, 321, 64, eval(0 - (counter*(321/6000))), 34, 321, 64);
	}
	if (threeSecCounter == 3 || threeSecCounter == 2 || threeSecCounter == 1)
	{
		ctxExp.clearRect(0, 0, 320, 430);
		ctxAnimation.clearRect(0, 0, 320, 430);
		ctxAnimation.fillText(threeSecCounter, 185, 230);
	}
	if (threeSecCounter == 0) {
		ctxAnimation.clearRect(0, 0, 320, 430);
		ctxAnimation.font = "80px Arial";
		ctxAnimation.fillStyle = '#25BE13';
		ctxAnimation.fillText('GO', 185, 230);
	}
	if (threeSecCounter == -1) {
		ctxAnimation.clearRect(0, 0, 320, 430);
		stopDrawingThreeSec();
		//threeSecCounter = 8;
		roundStart();
	}
	threeSecCounter--;
}
function drawThreeSec() {
	drawGratii();
	threeSec();
}
function startDrawingThreeSec() {
	stopDrawingThreeSec();
	drawIntervalThreeSec = setInterval(drawThreeSec, fps);
}
function stopDrawingThreeSec() {
	clearInterval(drawIntervalThreeSec);
}
//Functions for controling and displaying 60 sec timer and displaying gratii
function draw() {
	drawTimer();
	//drawGratii();
}
function startDrawing() {
	stopDrawing();
	drawInterval = setInterval(draw, timerFps);
}
function stopDrawing() {
	clearInterval(drawInterval);
}
function drawTimer() {
	ctxTime.clearRect(0, 0, 320, 430);
	counter++;

	if (counter < 4500) {
		ctxTime.drawImage(timerBlue, 0, 0, 321, 64, eval(0 - (counter*(321/6000))), 34, 321, 64);
		gratiiMultiplier = 2;
	}
	else {
		ctxTime.drawImage(timerRed, 0, 0, 321, 64, eval(0 - (counter*(321/6000))), 34, 321, 64);
		gratiiMultiplier = 1;
	}
	if (counter == 6000) {
		stopDrawing();
		//expression = '';
		//threeSecCounter = 3;
		//roundEnd();
	}
}

function drawHint() {
	hint();
}
function startDrawingHint() {
	stopDrawingHint();
	drawHintInterval = setInterval(drawHint, hintFps);
}
function stopDrawingHint() {
	clearInterval(drawHintInterval);
}
function hint() {
	hintCounter--;
	lockSkip = true;
	ctxAnimation.clearRect(0, 0, 320, 430);
	ctxAnimation.font = "60px Arial";
	ctxAnimation.fillStyle = 'blue';
	if (pointUsage == 1) {
		if (hintCounter > 45) {
			ctxAnimation.globalAlpha = transparency;
			ctxAnimation.fillText('Hint:', 185, 230);
		}
		else if (hintCounter > 40 && hintCounter <= 45) {
			ctxAnimation.globalAlpha = transparency;
			ctxAnimation.fillText(Combinations[cardCombo][4], 185, 230);
		}
		else if (hintCounter >= 0 && hintCounter <= 40) {
			transparency = transparency - .025;
			ctxAnimation.globalAlpha = transparency;
			ctxAnimation.fillText(Combinations[cardCombo][4], 185, 230);
		}
	}
	else if (pointUsage == 2) {
		if (hintCounter > 45) {
			ctxAnimation.globalAlpha = transparency;
			ctxAnimation.fillText('Hint:', 185, 230);
		}
		if (hintCounter > 40 && hintCounter <= 45) {
			ctxAnimation.globalAlpha = transparency;
			ctxAnimation.fillText(Combinations[cardCombo][4] + Combinations[cardCombo][5], 173, 230);
		}
		if (hintCounter >= 0 && hintCounter <= 40) {
			transparency = transparency - .025;
			ctxAnimation.globalAlpha = transparency;
			ctxAnimation.fillText(Combinations[cardCombo][4] + Combinations[cardCombo][5], 173, 230);
		}
	}
	else if (pointUsage == 3) {
		if (hintCounter > 45) {
			ctxAnimation.globalAlpha = transparency;
			ctxAnimation.fillText('Hint:', 185, 230);
		}
		if (hintCounter > 40 && hintCounter <= 45) {
			ctxAnimation.globalAlpha = transparency;
			ctxAnimation.fillText(Combinations[cardCombo][4] + Combinations[cardCombo][5] + Combinations[cardCombo][6], 160, 230);
		}
		if (hintCounter >= 0 && hintCounter <= 40) {
			transparency = transparency - .025;
			ctxAnimation.globalAlpha = transparency;
			ctxAnimation.fillText(Combinations[cardCombo][4] + Combinations[cardCombo][5] + Combinations[cardCombo][6], 160, 230);
		}
	}
	if (hintCounter == -1) {
		lockPoints = false;
		lockSkip = false;
		stopDrawingHint();
		transparency = 1;
		ctxAnimation.globalAlpha = transparency;
	}
}
function skipScreen() {
	document.removeEventListener(startEvent, gameScreenPressed, false);
	document.removeEventListener(endEvent, gameScreenReleased, false);
	document.addEventListener(startEvent, skipScreenPressed, false);
	document.addEventListener(endEvent, skipScreenReleased, false);

	ctxBg.globalAlpha = .1;
	ctxGrid.globalAlpha = .1;
	ctxNumGrid.globalAlpha = .1;
	ctxOps.globalAlpha = .1;
	ctxPts.globalAlpha = .1;
	ctxExp.globalAlpha = .1;
	ctxGratii.globalAlpha = .1;
	ctxTime.globalAlpha = .1;
	ctxAnimation.GlobalAlpha = .1;
	ctxBg.clearRect(0,0,320,430);
	ctxOps.clearRect(0,0,320,430);
	ctxPts.clearRect(0,0,320,430);
	ctxExp.clearRect(0,0,320,430);
	ctxTime.clearRect(0,0,320,430);
	ctxGratii.clearRect(0,0,320,430);
	ctxGrid.clearRect(0,0,320,430);
	ctxNumGrid.clearRect(0,0,320,430);
	drawBg();
	drawPoints();
	drawTimer();
	drawGrid();
	//ctxGrid.drawImage(grid, 0, 0, 260, 269, 57, 100, 260, 269);
	drawOperators();
	drawGratii();
	ctxSkip.fillStyle = '#ffffff';
	ctxSkip.fillRect(59,102,200,140);
	ctxSkip.fillStyle = '#374464';
	ctxSkip.fillRect(61,104,196,136);

	ctxAnimation.font = "18px arial";
	ctxAnimation.fillStyle = '#ffffff';
	ctxAnimation.fillText('Skip current round?', 159, 132);
	ctxAnimation.fillRect(77.33,175,75,50);
	ctxAnimation.clearRect(79.33,177,71,46);
	ctxAnimation.fillRect(167.66,175,75,50);
	ctxAnimation.clearRect(169.66,177,71,46);
	ctxAnimation.font = "bold 14px arial";
	ctxAnimation.fillText('Skip', 115, 204);
	ctxAnimation.fillText('Stay', 204, 204);
}

function drawGratii() {
	return;

	ctxGratii.clearRect(0, 0, 240, 34);
	var gratiiDistance = 195;
	var gratiiY = 24;
	ctxGratii.fillStyle = '#F9F4CE';
	ctxGratii.font = "18px Open Sans";
	if (gratii < 10) {
		ctxGratii.fillText(gratii, gratiiDistance, gratiiY);
	}
	else if (gratii >= 10 && gratii < 100) {
		ctxGratii.fillText(gratii, gratiiDistance-10, gratiiY);
	}
	else if (gratii >= 100 && gratii < 1000) {
		ctxGratii.fillText(gratii, gratiiDistance-20, gratiiY);
	}
	else if (gratii >= 1000 && gratii < 10000) {
		ctxGratii.fillText(gratii, gratiiDistance-30, gratiiY);
	}
	else if (gratii >= 10000) {
		ctxGratii.fillText(gratii, gratiiDistance-40, gratiiY);
	}
}
		var touchDevice = false;
		var startEvent = 'mousedown';
		var endEvent = 'mouseup';
//function that is called when game loads
function init() {
	
		try {
			document.createEvent('TouchEvent');
			startEvent = 'touchstart';
			endEvent = 'touchend';
			touchDevice = true;
		} catch(e) {}
	//startGratiiSession("XXIV"); //brian said include this
	drawSplash();
	document.addEventListener(startEvent, splashScreenPressed, false);
	document.addEventListener(endEvent, splashScreenReleased, false);
}

//Function called when play button on splash page is pressed
function playGame() {
	//removes splash screen event listeners for press events
	document.removeEventListener(startEvent, splashScreenPressed, false);
	document.removeEventListener(endEvent, splashScreenReleased, false);
	document.removeEventListener(startEvent, instructionsScreenPressed, false);
	document.removeEventListener(endEvent, instructionsScreenReleased, false);
	//adds game screen event listeners for press events
	document.addEventListener(startEvent, gameScreenPressed, false);
	document.addEventListener(endEvent, gameScreenReleased, false);
	//draws UI
	drawBg();
	drawPoints();
	drawOperators();
	drawGrid();
	preRoundStart();
}

function loadInstructions() {
	ctxBg.drawImage(instructions, 0, 0, 320, 430, 0, 0, 320, 430);
	document.removeEventListener(startEvent, splashScreenPressed, false);
	document.removeEventListener(endEvent, splashScreenReleased, false);
	//adds game screen event listeners for press events
	document.addEventListener(startEvent, instructionsScreenPressed, false);
	document.addEventListener(endEvent, instructionsScreenReleased, false);
}

//stops countdown timer, starts drawing score and counts down the three seconds
function preRoundStart() {
	lockSkip = true;
	lockBackspace = true;
	lockPoints = true;
	stopDrawing();
	//gratiiMultiplier = 1;
	counter = 0;
	// pointUsage = 0;
	transparency = 1;
	ctxAnimation.globalAlpha = transparency;
	startDrawingThreeSec();
	drawPoints();
}

function roundStart() {
	ctxGratii.clearRect(274, 30, 320, 80);
	ctxGratii.drawImage(imageBackspace, 0, 0, 46, 64, 274, 34, 46, 64);
	startDrawing();
	//Clear Canvas
	ctxExp.clearRect(0, 0, 320, 430);
	ctxNumGrid.clearRect(0, 0, 320, 430);

	//Generate Random Card Combination
	if (incorrectTryAgain == false) {
		cardCombo = Math.floor((Math.random()*401)+0);
	}
	ctxTime.drawImage(timerBlue, 0, 0, 321, 64, eval(0 - (counter*(321/60))), 34, 321, 64);
	//Draw Numbers to Grid
	ctxNumGrid.fillStyle = '#413742';
	ctxNumGrid.font = "53px Myriad Pro";
	ctxNumGrid.fillText(Combinations[cardCombo][0], 110, 178);
	ctxNumGrid.fillText(Combinations[cardCombo][1], 240, 178);
	ctxNumGrid.fillText(Combinations[cardCombo][2], 110, 308);
	ctxNumGrid.fillText(Combinations[cardCombo][3], 240, 308);

	//Reset Positions
	position1 = '';
	position2 = '';
	position3 = '';
	position4 = '';
	position5 = '';
	position6 = '';
	position7 = '';
	position8 = '';
	position9 = '';
	position10 = '';
	position11 = '';

	p1GridLoc = '';
	p2GridLoc = '';
	p3GridLoc = '';
	p4GridLoc = '';
	p5GridLoc = '';
	p6GridLoc = '';
	p7GridLoc = '';
	p8GridLoc = '';
	p9GridLoc = '';
	p10GridLoc = '';
	p11GridLoc = '';

	//Reset Locks
	topLeftLock = false;
	topRightLock = false;
	bottomLeftLock = false;
	bottomRightLock = false;
	lockGrid = false;
	lockMDAS = true;
	lockLeftParen = false;
	lockRightParen = false;
	lockSkip = false;
	lockBackspace = false;
	lockPoints = false;

	//Reset Variables
	gridNum = '';
	operation = '';
	openParen = 0;
	closedParen = 0;
	expression = '';
	incorrectTryAgain = false;
	tempGratii = 0;
	incorrectAnswerTracker = false;

	drawGrid();
}
function drawSplash() {
	ctxBg.drawImage(splash, 0, 0, 320, 430, 0, 0, 320, 430);//replace with actual splash screen
}

//Method - If user presses inside coordinate bounds of button, return true
Button.prototype.checkPressed = function() {
	if(this.xLeft <= pressX && pressX <= this.xRight && this.yTop <= pressY && pressY <= this.yBottom) return true;
};

function drawBg() {
	ctxBg.drawImage(background, 0, 0, 320, 430, 0, 0, 320, 430);
	drawGratii();
	ctxGratii.drawImage(imageBackspace, 0, 0, 46, 64, 274, 34, 46, 64);
	ctxTime.drawImage(timerBlue, 0, 0, 321, 64, eval(0 - (counter*(321/60))), 34, 321, 64);
}

function drawOperators() {
	ctxOps.drawImage(op_addition_up, 0, 0, 56, 60, 5, 370, 56, 60);
	ctxOps.drawImage(op_subtraction_up, 0, 0, 56, 60, 67, 370, 56, 60);
	ctxOps.drawImage(op_multiplication_up, 0, 0, 56, 60, 128, 370, 56, 60);
	ctxOps.drawImage(op_division_up, 0, 0, 56, 60, 189, 370, 56, 60);
	ctxOps.drawImage(op_leftparen_up, 0, 0, 29, 60, 250, 370, 29, 60);
	ctxOps.drawImage(op_rightparen_up, 0, 0, 29, 60, 284, 370, 29, 60);
}

function drawGrid() {
	ctxGrid.clearRect(0, 0, 320, 430);
	ctxGrid.drawImage(grid, 0, 0, 260, 269, 57, 100, 260, 269);
	if (threeSecCounter == -2) {
		ctxNumGrid.clearRect(0, 0, 320, 430);
		ctxNumGrid.fillStyle = '#413742';
		ctxNumGrid.font = "53px Myriad Pro";
		ctxNumGrid.fillText(Combinations[cardCombo][0], 110, 178);
		ctxNumGrid.fillText(Combinations[cardCombo][1], 240, 178);
		ctxNumGrid.fillText(Combinations[cardCombo][2], 110, 308);
		ctxNumGrid.fillText(Combinations[cardCombo][3], 240, 308);

		if (topLeftLock == true) {
			ctxGrid.drawImage(gridTopLeftUsed, 0, 0, 129, 133, 57, 100, 129, 133);
			ctxNumGrid.fillStyle = '#bebbbe';
			ctxNumGrid.fillText(Combinations[cardCombo][0], 110, 178);
		}
		if (topRightLock == true) {
			ctxGrid.drawImage(gridTopRightUsed, 0, 0, 130, 133, 187, 100, 130, 133);
			ctxNumGrid.fillStyle = '#bebbbe';
			ctxNumGrid.fillText(Combinations[cardCombo][1], 240, 178);
		}
		if (bottomLeftLock == true) {
			ctxGrid.drawImage(gridBottomLeftUsed, 0, 0, 129, 135, 57, 234, 129, 135);
			ctxNumGrid.fillStyle = '#bebbbe';
			ctxNumGrid.fillText(Combinations[cardCombo][2], 110, 308);
		}
		if (bottomRightLock == true) {
			ctxGrid.drawImage(gridBottomRightUsed, 0, 0, 130, 135, 187, 234, 130, 135);
			ctxNumGrid.fillStyle = '#bebbbe';
			ctxNumGrid.fillText(Combinations[cardCombo][3], 240, 308);
		}
	}
}

function drawPoints() {
	ctxPts.clearRect(0, 0, 320, 430);

	var pp = (3-pointUsage);

	if (pp == 0) {
		ctxPts.drawImage(point_empty, 0, 0, 54, 59, 3, 125, 54, 59);
		ctxPts.drawImage(point_empty, 0, 0, 54, 59, 3, 215, 54, 59);
		ctxPts.drawImage(point_empty, 0, 0, 54, 59, 3, 305, 54, 59);
	}
	if (pp == 1) {
		ctxPts.drawImage(point_empty, 0, 0, 54, 59, 3, 125, 54, 59);
		ctxPts.drawImage(point_empty, 0, 0, 54, 59, 3, 215, 54, 59);
		ctxPts.drawImage(point_full, 0, 0, 54, 59, 3, 305, 54, 59);
	}
	if (pp == 2) {
		ctxPts.drawImage(point_empty, 0, 0, 54, 59, 3, 125, 54, 59);
		ctxPts.drawImage(point_full, 0, 0, 54, 59, 3, 215, 54, 59);
		ctxPts.drawImage(point_full, 0, 0, 54, 59, 3, 305, 54, 59);
	}
	if (pp == 3) {
		ctxPts.drawImage(point_full, 0, 0, 54, 59, 3, 125, 54, 59);
		ctxPts.drawImage(point_full, 0, 0, 54, 59, 3, 215, 54, 59);
		ctxPts.drawImage(point_full, 0, 0, 54, 59, 3, 305, 54, 59);
	}
}

//Positions for Expression Bar
var pY = 77;
var p1X = 10;
var p2X = 28;
var p3X = 46;
var p4X = 64;
var p5X = 82;
var p6X = 100;
var p7X = 118;
var p8X = 136;
var p9X = 154;
var p10X = 172;
var p11X = 190;
var p12X = 214;
var p13X = 232;
var p14X = 250;

function lockSet() {
	if (gridNum == '0') {
		topLeftLock = true;
	}
	else if (gridNum == '1') {
		topRightLock = true;
	}
	else if (gridNum == '2') {
		bottomLeftLock = true;
	}
	else if (gridNum == '3') {
		bottomRightLock = true;
	}
	drawGrid();
}

function refillExpressionBar() {
	ctxExp.fillStyle = '#413742';
	ctxExp.fillText(position1, p1X, pY);
	ctxExp.fillText(position2, p2X, pY);
	ctxExp.fillText(position3, p3X, pY);
	ctxExp.fillText(position4, p4X, pY);
	ctxExp.fillText(position5, p5X, pY);
	ctxExp.fillText(position6, p6X, pY);
	ctxExp.fillText(position7, p7X, pY);
	ctxExp.fillText(position8, p8X, pY);
	ctxExp.fillText(position9, p9X, pY);
	ctxExp.fillText(position10, p10X, pY);
}

function backspaceUnlock() {
	if (gridNum == 0 && operation != '+' && operation != '-' && operation != '*' && operation != '/' && operation != '(' && operation != ')') {
		topLeftLock = false;
		lockGrid = false;
		lockMDAS = true;
		if (openParen < 2) {
			lockLeftParen = false;
		}
		if (closedParen < 2) {
			lockRightParen = false;
		}
		gridNum = '';
	}
	else if (gridNum == 1 && operation != '+' && operation != '-' && operation != '*' && operation != '/' && operation != '(' && operation != ')') {
		topRightLock = false;
		lockGrid = false;
		lockMDAS = true;
		if (openParen < 2) {
			lockLeftParen = false;
		}
		if (closedParen < 2) {
			lockRightParen = false;
		}
		gridNum = '';
	}
	else if (gridNum == 2 && operation != '+' && operation != '-' && operation != '*' && operation != '/' && operation != '(' && operation != ')') {
		bottomLeftLock = false;
		lockGrid = false;
		lockMDAS = true;
		if (openParen < 2) {
			lockLeftParen = false;
		}
		if (closedParen < 2) {
			lockRightParen = false;
		}
		gridNum = '';
	}
	else if (gridNum == 3 && operation != '+' && operation != '-' && operation != '*' && operation != '/' && operation != '(' && operation != ')') {
		bottomRightLock = false;
		lockGrid = false;
		lockMDAS = true;
		if (openParen < 2) {
			lockLeftParen = false;
		}
		if (closedParen < 2) {
			lockRightParen = false;
		}
		gridNum = '';
	}

	if (operation == '(') {
		lockLeftParen = false;
		lockMDAS = false;
		openParen--;
	}
	else if (operation == ')') {
		lockRightParen = false;
		closedParen--;
		if (topLeftLock == false || topRightLock == false || bottomLeftLock == false || bottomRightLock == false) {
			lockMDAS = false;
		}
	}
	if (operation == '+' || operation == '-' || operation == '*' || operation == '/') {
		lockGrid = true;
		lockMDAS = false;
		if (openParen < 2) {
			lockLeftParen = false;
		}
		if (closedParen < 2) {
			lockRightParen = false;
		}
	}
	operation = '';
	drawGrid();
}
var p1GridLoc = '';
var p2GridLoc = '';
var p3GridLoc = '';
var p4GridLoc = '';
var p5GridLoc = '';
var p6GridLoc = '';
var p7GridLoc = '';
var p8GridLoc = '';
var p9GridLoc = '';
var p10GridLoc = '';
var p11GridLoc = '';

function backspace() {
	if (position1 != '' && position2 == '') {
		operation = position1;
		position1 = '';
		if (p1GridLoc != '') {
			gridNum = p1GridLoc;
		}
		p1GridLoc = '';
	}
	else if (position2 != '' && position3 == '') {
		operation = position2;
		position2 = '';
		if (p2GridLoc != '') {
			gridNum = p2GridLoc;
		}
		p2GridLoc = '';
	}
	else if (position3 != '' && position4 == '') {
		operation = position3;
		position3 = '';
		if (p3GridLoc != '') {
			gridNum = p3GridLoc;
		}
		p3GridLoc = '';
	}
	else if (position4 != '' && position5 == '') {
		operation = position4;
		position4 = '';
		if (p4GridLoc != '') {
			gridNum = p4GridLoc;
		}
		p4GridLoc = '';
	}
	else if (position5 != '' && position6 == '') {
		operation = position5;
		position5 = '';
		if (p5GridLoc != '') {
			gridNum = p5GridLoc;
		}
		p5GridLoc = '';
	}
	else if (position6 != '' && position7 == '') {
		operation = position6;
		position6 = '';
		if (p6GridLoc != '') {
			gridNum = p6GridLoc;
		}
		p6GridLoc = '';
	}
	else if (position7 != '' && position8 == '') {
		operation = position7;
		position7 = '';
		if (p7GridLoc != '') {
			gridNum = p7GridLoc;
		}
		p7GridLoc = '';
	}
	else if (position8 != '' && position9 == '') {
		operation = position8;
		position8 = '';
		if (p8GridLoc != '') {
			gridNum = p8GridLoc;
		}
		p8GridLoc = '';
	}
	else if (position9 != '' && position10 == '') {
		operation = position9;
		position9 = '';
		if (p9GridLoc != '') {
			gridNum = p9GridLoc;
		}
		p9GridLoc = '';
	}
	else if (position10 != '' && position11 == '') {
		operation = position10;
		position10 = '';
		if (p10GridLoc != '') {
			gridNum = p10GridLoc;
		}
		p10GridLoc = '';
	}
	else if (position11 != '') {
		operation = position11;
		position11 = '';
		if (p11GridLoc != '') {
			gridNum = p11GridLoc;
		}
		p11GridLoc = '';
	}
	backspaceUnlock();
	ctxExp.clearRect(0, 0, 320, 430);
	refillExpressionBar();
	equationPreview();
}
var tempGratii = 0;


var tempCounter = 0;
var tempPointUsage = 0;

function roundEnd() {

	// alert('round end ' );
	// console.log( "counter: " + counter );
	// console.log( 'counter calc' + ((counter/60)*0.01).toFixed(2) );
	tempCounter = counter;
	tempPointUsage = pointUsage;

	// console.log( 'timeTremaingScore: ' + (1-((counter/60)*0.01)).toFixed(2) );
	var timeRemainingScore = (1-((counter/60)*0.01)).toFixed(2);

	// console.log( 'pointUsage = ' + pointUsage );

	var pointUsageScore = ((3-pointUsage)*0.01);
	// alert('pointUsage: ' + pointUsage);
	// alert('pointUsageScore: ' + pointUsageScore);
	// console.log( 'pointUsageScore: ' + pointUsageScore );

	var totalGratiiScore = ( parseFloat(timeRemainingScore) + parseFloat(pointUsageScore) ).toFixed(2);
	if (totalGratiiScore < 0.07) {
		totalGratiiScore = 0.07;
	}

	// console.log( 'totalScore is:' + totalGratiiScore);



	if (eval(expression) == 24) {

		//parent.arcade.twentyFour.gameOver(totalGratiiScore);
		
		var gameToken = "X7X7X7X";
		
		var thisGameID = parent.user.gameInProgress['gameID'];
		var equations = parent.user.gameInProgress['equations'];
		var equationForGameOver = equations.gameOver;
		var thisGameEvent = "gameOver";
		var scoreForThisEvent = totalGratiiScore*10;
		var gratiiEarned = Math.floor(scoreForThisEvent*equationForGameOver);
		

		parent.user.changeGratii(gratiiEarned);

		parent.user.arcadeEvents.push({"gameToken":gameToken, "finalScore":scoreForThisEvent, "eventName":thisGameEvent, "gameID":thisGameID});
		parent.user.postGameEvents();

		if (score < 3) {
			score++;
		}

		/*var online = navigator.onLine;
		if(online==false){
			alert("Uh oh! You've lost internet connection.");
			window.location = "../../users/html/arcade.html";
			return;
		}*/

		tempGratii = Math.round(eval((60-(counter/100)) * .17));
		gratii = gratii + (5 + Math.round(eval((60-(counter/100)) * .17)));
		newGratii = (5 + Math.round(eval((60-(counter/100)) * .17)))
		threeSecCounter = 8;
		// $.post("../api/gameOver.php", {score : newGratii}, "json");
		lockGrid = true;
		lockMDAS = true;
		lockLeftParen = true;
		lockRightParen = true;
		preRoundStart();
	}
}

function roundSkip() {

	// alert('skip round');
	// parent.arcade.twentyFour.reset();

	lockGrid = true;
	lockMDAS = true;
	lockLeftParen = true;
	lockRightParen = true;
	lockSkip = true;
	threeSecCounter = 3;
	skipDisplayCounter = 6;
	startDrawingSkipDisplay();
}

//called if operator pressed
function buildExpressionOperators() {
	ctxExp.fillStyle = '#413742';
	ctxExp.font = "31px Myriad Pro";
	if (position1 == '') {
		position1 = operation;
		ctxExp.fillText(position1, p1X, pY);
	}
	else if (position1 != '' && position2 == '') {
		position2 = operation;
		ctxExp.fillText(position2, p2X, pY);
	}
	else if (position2 != '' && position3 == '') {
		position3 = operation;
		ctxExp.fillText(position3, p3X, pY);
	}
	else if (position3 != '' && position4 == '') {
		position4 = operation;
		ctxExp.fillText(position4, p4X, pY);
	}
	else if (position4 != '' && position5 == '') {
		position5 = operation;
		ctxExp.fillText(position5, p5X, pY);
	}
	else if (position5 != '' && position6 == '') {
		position6 = operation;
		ctxExp.fillText(position6, p6X, pY);
	}
	else if (position6 != '' && position7 == '') {
		position7 = operation;
		ctxExp.fillText(position7, p7X, pY);
	}
	else if (position7 != '' && position8 == '') {
		position8 = operation;
		ctxExp.fillText(position8, p8X, pY);
	}
	else if (position8 != '' && position9 == '') {
		position9 = operation;
		ctxExp.fillText(position9, p9X, pY);
	}
	else if (position9 != '' && position10 == '') {
		position10 = operation;
		ctxExp.fillText(position10, p10X, pY);
	}
	else if (position10 != '' && position11 == '') {
		position11 = operation;
		ctxExp.fillText(position11, p11X, pY);
	}
	lockLeftParen = false;
	lockGrid = false;
	if (operation == ')') {
		lockGrid = true;
		lockLeftParen = true;
	}
	else if (operation == '(') {
		lockRightParen = true;
	}
	if (operation != ')') {
		lockMDAS = true;
	}
	if (operation == '+' || operation == '-' || operation == '*' || operation == '/') {
		lockRightParen = true;
	}
	equationPreview();
}

function equationPreview() {
	expression = position1 + position2 + position3 + position4 + position5 + position6 + position7 + position8 + position9 +position10 + position11;
	ctxExp.clearRect(p12X, 0, 320, 430);
	if (expression != '' && eval(expression) < 10 && eval(expression) > -10 ) {
		ctxExp.fillStyle = '#535353';
		ctxExp.fillText(Math.round(eval(expression)), p14X, pY);
	}
	else if (expression != '' && eval(expression) > 10 && eval(expression) < 100 || expression != '' && eval(expression) < -10 && eval(expression) > -100) {
		ctxExp.fillStyle = '#535353';
		ctxExp.fillText(Math.round(eval(expression)), p13X, pY);
	}
	else if (expression != '' && eval(expression) >= 100 || expression != '' && eval(expression) <=-100) {
		ctxExp.fillStyle = '#535353';
		ctxExp.fillText(Math.round(eval(expression)), p12X, pY);
	}
	//checks if round is over then executes roundEnd();
	if (openParen <= closedParen && topLeftLock == true && topRightLock == true && bottomLeftLock == true && bottomRightLock == true) {
		roundEnd();
	}
}

//called if grid is pressed
function buildExpressionNumbers() {
	ctxExp.fillStyle = '#413742';
	ctxExp.font = "31px Myriad Pro";
	if (position1 == '') {
		position1 = Combinations[cardCombo][gridNum];
		p1GridLoc = gridNum;
		ctxExp.fillText(position1, p1X, pY);
	}
	else if (position1 != '' && position2 == '') {
		position2 = Combinations[cardCombo][gridNum];
		p2GridLoc = gridNum;
		ctxExp.fillText(position2, p2X, pY);
	}
	else if (position2 != '' && position3 == '') {
		position3 = Combinations[cardCombo][gridNum];
		p3GridLoc = gridNum;
		ctxExp.fillText(position3, p3X, pY);
	}
	else if (position3 != '' && position4 == '') {
		position4 = Combinations[cardCombo][gridNum];
		p4GridLoc = gridNum;
		ctxExp.fillText(position4, p4X, pY);
	}
	else if (position4 != '' && position5 == '') {
		position5 = Combinations[cardCombo][gridNum];
		p5GridLoc = gridNum;
		ctxExp.fillText(position5, p5X, pY);
	}
	else if (position5 != '' && position6 == '') {
		position6 = Combinations[cardCombo][gridNum];
		p6GridLoc = gridNum;
		ctxExp.fillText(position6, p6X, pY);
	}
	else if (position6 != '' && position7 == '') {
		position7 = Combinations[cardCombo][gridNum];
		p7GridLoc = gridNum;
		ctxExp.fillText(position7, p7X, pY);
	}
	else if (position7 != '' && position8 == '') {
		position8 = Combinations[cardCombo][gridNum];
		p8GridLoc = gridNum;
		ctxExp.fillText(position8, p8X, pY);
	}
	else if (position8 != '' && position9 == '') {
		position9 = Combinations[cardCombo][gridNum];
		p9GridLoc = gridNum;
		ctxExp.fillText(position9, p9X, pY);
	}
	else if (position9 != '' && position10 == '') {
		position10 = Combinations[cardCombo][gridNum];
		p10GridLoc = gridNum;
		ctxExp.fillText(position10, p10X, pY);
	}
	else if (position10 != '' && position11 == '') {
		position11 = Combinations[cardCombo][gridNum];
		p11GridLoc = gridNum;
		ctxExp.fillText(position11, p11X, pY);
	}
	lockSet();
	lockLeftParen = true;
	lockRightParen = false;
	lockGrid = true;
	lockMDAS = false;
	drawGrid();
	if (topLeftLock == true && topRightLock == true && bottomLeftLock == true && bottomRightLock == true) {
		lockMDAS = true;
	}
	equationPreview();
}

//Event Functions
function splashScreenPressed(e) {
	var offsets = canvasBg.getBoundingClientRect();
	pressX = e.pageX - offsets.left;
	pressY = e.pageY - offsets.top;
}
function splashScreenReleased(e) {
	if (btnPlay.checkPressed()) {
		playGame();
	}
	if (btnInstructions.checkPressed()) {
		loadInstructions();
	}
}
function instructionsScreenPressed(e) {
	var offsets = canvasBg.getBoundingClientRect();
	pressX = e.pageX - offsets.left;
	pressY = e.pageY - offsets.top;
}

function skipScreenReleased(e) {
	if (btnSkipYes.checkPressed()) {
		//reset global alphas to 1
		ctxBg.globalAlpha = 1;
		ctxGrid.globalAlpha = 1;
		ctxNumGrid.globalAlpha = 1;
		ctxOps.globalAlpha = 1;
		ctxPts.globalAlpha = 1;
		ctxExp.globalAlpha = 1;
		ctxTime.globalAlpha = 1;
		ctxGratii.globalAlpha = 1;
		//clear all canvas
		ctxBg.clearRect(0,0,320,430);
		ctxSkip.clearRect(0,0,320,430);
		ctxOps.clearRect(0,0,320,430);
		ctxPts.clearRect(0,0,320,430);
		ctxExp.clearRect(0,0,320,430);
		ctxTime.clearRect(0,0,320,430);
		ctxGratii.clearRect(0,0,320,430);
		ctxGrid.clearRect(0,0,320,430);
		ctxNumGrid.clearRect(0,0,320,430);
		ctxAnimation.clearRect(0,0,320,430);
		//redraw
		ctxTime.drawImage(timerBlue, 0, 0, 321, 64, eval(0 - (counter*(321/60))), 104, 321, 64);
		drawBg();
		drawPoints();
		refillExpressionBar();
		drawOperators();
		drawGratii();
		ctxGrid.drawImage(grid, 0, 0, 260, 269, 57, 100, 260, 269);
		ctxGratii.drawImage(imageBackspace, 0, 0, 46, 64, 274, 34, 46, 64);
		lockGrid = true;
		lockMDAS = true;
		lockLeftParen = true;
		lockRightParen = true;
		//Reset Variables
		//counter = 0;
		gridNum = '';
		operation = '';
		openParen = 0;
		closedParen = 0;
		expression = '';
		document.removeEventListener(startEvent, skipScreenPressed, false);
		document.removeEventListener(endEvent, skipScreenReleased, false);
		document.addEventListener(startEvent, gameScreenPressed, false);
		document.addEventListener(endEvent, gameScreenReleased, false);
		if (score >= 1) {
			score--;
			roundSkip();
		}
		else {
			roundSkip();
		}
	}
	if (btnSkipNo.checkPressed()) {
		threeSecCounter = -2;
		document.removeEventListener(startEvent, skipScreenPressed, false);
		document.removeEventListener(endEvent, skipScreenReleased, false);
		document.addEventListener(startEvent, gameScreenPressed, false);
		document.addEventListener(endEvent, gameScreenReleased, false);

		//reset global alphas to 1
		ctxBg.globalAlpha = 1;
		ctxGrid.globalAlpha = 1;
		ctxNumGrid.globalAlpha = 1;
		ctxOps.globalAlpha = 1;
		ctxPts.globalAlpha = 1;
		ctxExp.globalAlpha = 1;
		ctxGratii.globalAlpha = 1;
		ctxTime.globalAlpha = 1;

		//clear all canvas
		ctxBg.clearRect(0,0,320,430);
		ctxOps.clearRect(0,0,320,430);
		ctxPts.clearRect(0,0,320,430);
		ctxExp.clearRect(0,0,320,430);
		ctxTime.clearRect(0,0,320,430);
		ctxGratii.clearRect(0,0,320,430);
		ctxGrid.clearRect(0,0,320,430);
		ctxSkip.clearRect(0,0,320,430);
		ctxNumGrid.clearRect(0,0,320,430);
		ctxAnimation.clearRect(0,0,320,430);

		drawTimer();
		drawBg();
		drawPoints();
		drawOperators();
		drawGratii();
		drawGrid();
		refillExpressionBar();
		if (counter < 4500) {
			ctxTime.drawImage(timerBlue, 0, 0, 321, 64, eval(0 - (counter*(321/6000))), 34, 321, 64);
		}
		else {
			ctxTime.drawImage(timerRed, 0, 0, 321, 64, eval(0 - (counter*(321/6000))), 34, 321, 64);
		}
	}
}
function instructionsScreenReleased(e) {
	if (btnInstructionsPlay.checkPressed()) {
		playGame();
	}
}
function skipScreenPressed(e) {
	var offsets = canvasBg.getBoundingClientRect();
	pressX = e.pageX - offsets.left;
	pressY = e.pageY - offsets.top;
}

function gameScreenPressed(e) {
	var offsets = canvasBg.getBoundingClientRect();
	pressX = e.pageX - offsets.left;
	pressY = e.pageY - offsets.top;

	//Grid Button Down Events
	if (btnGridTopLeft.checkPressed()) {
		ctxGrid.drawImage(grid_topleft, 0, 0, 260, 269, 57, 100, 260, 269);
		if (topLeftLock == false && lockGrid == false) {
			ctxNumGrid.fillStyle = '#3b6234';
			ctxNumGrid.fillText(Combinations[cardCombo][0], 110, 178);
		}
	}
	if (btnGridTopRight.checkPressed()) {
		ctxGrid.drawImage(grid_topright, 0, 0, 260, 269, 57, 100, 260, 269);
		if (topRightLock == false && lockGrid == false) {
			ctxNumGrid.fillStyle = '#3b6234';
			ctxNumGrid.fillText(Combinations[cardCombo][1], 240, 178);
		}
	}
	if (btnGridBottomLeft.checkPressed()) {
		ctxGrid.drawImage(grid_bottomleft, 0, 0, 260, 269, 57, 100, 260, 269);
		if (bottomLeftLock == false && lockGrid == false) {
			ctxNumGrid.fillStyle = '#3b6234';
			ctxNumGrid.fillText(Combinations[cardCombo][2], 110, 308);
		}
	}
	if (btnGridBottomRight.checkPressed()) {
		ctxGrid.drawImage(grid_bottomright, 0, 0, 260, 269, 57, 100, 260, 269);
		if (bottomRightLock == false && lockGrid == false) {
			ctxNumGrid.fillStyle = '#3b6234';
			ctxNumGrid.fillText(Combinations[cardCombo][3], 240, 308);
		}
	}
	//Operator Button Down Events
	if (btnAddition.checkPressed()) {
		ctxOps.drawImage(op_addition_down, 0, 0, 56, 60, 5, 370, 56, 60);
	}
	if (btnSubtraction.checkPressed()) {
		ctxOps.drawImage(op_subtraction_down, 0, 0, 56, 60, 67, 370, 56, 60);
	}
	if (btnMultiplication.checkPressed()) {
		ctxOps.drawImage(op_multiplication_down, 0, 0, 56, 60, 128, 370, 56, 60);
	}
	if (btnDivision.checkPressed()) {
		ctxOps.drawImage(op_division_down, 0, 0, 56, 60, 189, 370, 56, 60);
	}
	if (btnLeftParen.checkPressed()) {
		ctxOps.drawImage(op_leftparen_down, 0, 0, 29, 60, 250, 370, 29, 60);
	}
	if (btnRightParen.checkPressed()) {
		ctxOps.drawImage(op_rightparen_down, 0, 0, 29, 60, 284, 370, 29, 60);
	}

	if (btnBs.checkPressed() && lockBackspace == false)  {
		if (counter < 4500) {
			ctxGratii.clearRect(274, 30, 320, 80);
			ctxGratii.drawImage(imageBackspaceDown, 0, 0, 46, 64, 274, 34, 46, 64);
		}
		else {
			ctxGratii.clearRect(274, 30, 320, 80);
			ctxGratii.drawImage(backspaceRedDown, 0, 0, 46, 64, 274, 34, 46, 64);
		}
	}
}
function gameScreenReleased(e) {
	ctxGrid.clearRect(0, 0, 320, 430);
	drawGrid();
	ctxOps.clearRect(0, 0, 320, 430);
	drawOperators();
	ctxGratii.clearRect(274, 30, 320, 80);
	ctxGratii.drawImage(imageBackspace, 0, 0, 46, 64, 274, 34, 46, 64);

	//var offsets = canvasBg.getBoundingClientRect();
	//pressX = e.pageX - offsets.left;
	//pressY = e.pageY - offsets.top;

	//Backspace Button Release Event
	if (btnBs.checkPressed() && lockBackspace == false) {
		backspace();
	}

	//Quit Button Release Event
	if (btnQuit.checkPressed()) {
		quitGame();
	}

	//Skip Button Release Event
	if (btnSkip.checkPressed() && lockSkip == false) {
	skipScreen();
	}
	//Point Button Release Events
	if (btnTopPoint.checkPressed() && score == 3 && lockPoints == false) {
		lockPoints = true;
		hintCounter = 55;
		pointUsage++;
		transparency = 1;
		startDrawingHint();
		score--;
		drawPoints();
	}
	if (btnMidPoint.checkPressed() && score > 1 && lockPoints == false) {
		lockPoints = true;
		hintCounter = 55;
		pointUsage++;
		transparency = 1;
		startDrawingHint();
		score--;
		drawPoints();
	}
	if (btnBottomPoint.checkPressed() && score >= 1 && lockPoints == false) {
		lockPoints = true;
		hintCounter = 55;
		pointUsage++;
		transparency = 1;
		startDrawingHint();
		score--;
		drawPoints();
	}
	//Grid Button Release Events

	if (btnGridTopLeft.checkPressed()) {
		gridNum = 0;
		if (topLeftLock == false && lockGrid == false) {
			buildExpressionNumbers();
		}
	}
	if (btnGridTopRight.checkPressed()) {
		gridNum = 1;
		if (topRightLock == false && lockGrid == false) {
			buildExpressionNumbers();
		}
	}
	if (btnGridBottomLeft.checkPressed()) {
		gridNum = 2;
		if (bottomLeftLock == false && lockGrid == false) {
			buildExpressionNumbers();
		}
	}
	if (btnGridBottomRight.checkPressed()) {
		gridNum = 3;
		if (bottomRightLock == false && lockGrid == false) {
			buildExpressionNumbers();
		}
	}
	//Expression Button Release Events
	if (btnAddition.checkPressed() && lockMDAS == false) {
		operation = '+';
		buildExpressionOperators();
	}
	if (btnSubtraction.checkPressed() && lockMDAS == false) {
		operation = '-';
		buildExpressionOperators();
	}
	if (btnMultiplication.checkPressed() && lockMDAS == false) {
		operation = '*';
		buildExpressionOperators();
	}
	if (btnDivision.checkPressed() && lockMDAS == false) {
		operation = '/';
		buildExpressionOperators();
	}
	if (btnLeftParen.checkPressed() && openParen < 2 && lockLeftParen == false) {
		operation = '(';
		openParen++;
		buildExpressionOperators();
	}
	if (btnRightParen.checkPressed() && closedParen < openParen && lockRightParen == false) {
		lockLeftParen = true;
		operation = ')';
		closedParen++;
		buildExpressionOperators();
	}
}