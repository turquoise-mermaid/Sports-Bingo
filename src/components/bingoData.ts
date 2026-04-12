import {
  Goal,
  Flag,
  Users,
  Zap,
  Trophy,
  Shirt,
  Radio,
  Target,
  Circle,
  Diamond,
  Square,
  Heart,
  Shield,
  Star,
  Flame,
  Home,
  Award,
  Timer,
  Activity,
  Crosshair,
  Box,
  CircleDot,
  Rocket,
  Crown,
} from 'lucide-react';
import { Sport } from '../App';
import { LucideIcon } from 'lucide-react';

export interface BingoItem {
  name: string;
  icon: LucideIcon;
  description: string;
}

const soccerItems: BingoItem[] = [
  { name: 'Goal', icon: Goal, description: 'A player scores a goal into the net!' },
  { name: 'Corner Kick', icon: Flag, description: 'The ball goes out of bounds near the goal, resulting in a corner kick.' },
  { name: 'Yellow Card', icon: Square, description: 'A player receives a yellow card warning from the referee.' },
  { name: 'Offside', icon: Flag, description: 'A player is caught in an offside position.' },
  { name: 'Penalty', icon: Crosshair, description: 'A penalty kick is awarded for a foul in the box.' },
  { name: 'Substitution', icon: Users, description: 'A player is substituted off the field.' },
  { name: 'Header', icon: Activity, description: 'A player heads the ball with their head.' },
  { name: 'Tackle', icon: Shield, description: 'A defensive tackle to win the ball back.' },
  { name: 'Throw-In', icon: Circle, description: 'The ball is thrown back into play from the sideline.' },
  { name: 'Assist', icon: Zap, description: 'A player makes an assist leading to a goal.' },
  { name: 'Save', icon: Target, description: 'The goalkeeper makes a crucial save.' },
  { name: 'Red Card', icon: Diamond, description: 'A player is sent off with a red card.' },
  { name: 'Free Space', icon: Star, description: 'Free space - automatically marked!' },
  { name: 'Free Kick', icon: Flame, description: 'A free kick is awarded for a foul.' },
  { name: 'Cross', icon: Trophy, description: 'A player crosses the ball into the box.' },
  { name: 'Dribble', icon: Rocket, description: 'A player dribbles past defenders.' },
  { name: 'Whistle', icon: Radio, description: 'The referee blows the whistle for a call.' },
  { name: 'Chant', icon: Users, description: 'The crowd erupts in a team chant.' },
  { name: 'Injury', icon: Heart, description: 'A player goes down with an injury.' },
  { name: 'Hat Trick', icon: Crown, description: 'A player scores three goals in one game!' },
  { name: 'Volley', icon: Award, description: 'A player strikes the ball before it hits the ground.' },
  { name: 'Nutmeg', icon: CircleDot, description: 'The ball is passed between an opponent\'s legs.' },
  { name: 'Clean Sheet', icon: Shield, description: 'The team doesn\'t concede any goals.' },
  { name: 'Own Goal', icon: Home, description: 'A player accidentally scores on their own goal.' },
  { name: 'VAR Check', icon: Box, description: 'Video Assistant Referee reviews a decision.' },
];

const baseballItems: BingoItem[] = [
  { name: 'Home Run', icon: Rocket, description: 'The batter hits the ball out of the park!' },
  { name: 'Strikeout', icon: Zap, description: 'The batter strikes out with three strikes.' },
  { name: 'Double Play', icon: Users, description: 'Two outs are recorded on one play.' },
  { name: 'Walk', icon: Flag, description: 'The batter reaches base on four balls.' },
  { name: 'Stolen Base', icon: Activity, description: 'A runner steals a base successfully.' },
  { name: 'Fly Out', icon: Circle, description: 'The ball is caught in the air for an out.' },
  { name: 'Ground Out', icon: Diamond, description: 'The batter hits a ground ball and is thrown out.' },
  { name: 'Hit by Pitch', icon: Heart, description: 'The batter is hit by a pitched ball.' },
  { name: 'Bunt', icon: Target, description: 'The batter bunts the ball.' },
  { name: 'Error', icon: Flame, description: 'A fielding error allows a runner to advance.' },
  { name: 'Triple', icon: Trophy, description: 'The batter reaches third base on a hit.' },
  { name: 'Sacrifice Fly', icon: Award, description: 'A fly ball allows a runner to score.' },
  { name: 'Free Space', icon: Star, description: 'Free space - automatically marked!' },
  { name: 'Foul Ball', icon: Flag, description: 'The ball is hit into foul territory.' },
  { name: 'Pitching Change', icon: Users, description: 'A new pitcher enters the game.' },
  { name: 'Pop Up', icon: CircleDot, description: 'A high fly ball in the infield.' },
  { name: 'Wild Pitch', icon: Radio, description: 'The pitched ball gets past the catcher.' },
  { name: 'Grand Slam', icon: Crown, description: 'A home run with the bases loaded!' },
  { name: 'Caught Stealing', icon: Shield, description: 'A runner is caught trying to steal a base.' },
  { name: 'Infield Hit', icon: Crosshair, description: 'A hit that stays in the infield.' },
  { name: 'Perfect Game', icon: Star, description: 'No batter reaches base throughout the game.' },
  { name: 'Balk', icon: Box, description: 'The pitcher makes an illegal motion.' },
  { name: 'Diving Catch', icon: Goal, description: 'A spectacular diving catch in the outfield.' },
  { name: 'RBI', icon: Shirt, description: 'A run is batted in by the hitter.' },
  { name: 'Called Strike', icon: Timer, description: 'The umpire calls a strike without a swing.' },
];

const basketballItems: BingoItem[] = [
  { name: '3-Pointer', icon: Target, description: 'A shot made from beyond the three-point line!' },
  { name: 'Dunk', icon: Rocket, description: 'A player slams the ball through the hoop.' },
  { name: 'Block', icon: Shield, description: 'A defensive player blocks a shot.' },
  { name: 'Steal', icon: Zap, description: 'The ball is stolen from the opposing team.' },
  { name: 'Assist', icon: Users, description: 'A pass that leads directly to a basket.' },
  { name: 'Rebound', icon: Activity, description: 'A player grabs a missed shot.' },
  { name: 'Free Throw', icon: CircleDot, description: 'An uncontested shot from the free throw line.' },
  { name: 'Foul', icon: Radio, description: 'A player commits a foul.' },
  { name: 'Timeout', icon: Timer, description: 'A team calls a timeout.' },
  { name: 'Turnover', icon: Flame, description: 'The ball is lost to the opposing team.' },
  { name: 'Alley-Oop', icon: Trophy, description: 'A pass thrown near the basket for a slam dunk.' },
  { name: 'Layup', icon: Circle, description: 'A close-range shot near the basket.' },
  { name: 'Free Space', icon: Star, description: 'Free space - automatically marked!' },
  { name: 'Double-Double', icon: Award, description: 'A player reaches double digits in two stats.' },
  { name: 'Fast Break', icon: Flag, description: 'A quick offensive play after gaining possession.' },
  { name: 'Jump Ball', icon: CircleDot, description: 'Two players jump for the ball at center court.' },
  { name: 'Technical Foul', icon: Square, description: 'A foul for unsportsmanlike conduct.' },
  { name: 'Buzzer Beater', icon: Crown, description: 'A shot made just as time expires!' },
  { name: 'Crossover', icon: Crosshair, description: 'A dribbling move to get past a defender.' },
  { name: 'And-One', icon: Heart, description: 'A made basket while being fouled.' },
  { name: 'Triple-Double', icon: Star, description: 'Double digits in three statistical categories!' },
  { name: 'Traveling', icon: Box, description: 'A violation for moving without dribbling.' },
  { name: 'Charge', icon: Diamond, description: 'An offensive foul for running into a defender.' },
  { name: 'Substitution', icon: Shirt, description: 'A player substitution is made.' },
  { name: 'Bank Shot', icon: Goal, description: 'The ball bounces off the backboard into the hoop.' },
];

const tennisItems: BingoItem[] = [
  { name: 'Ace', icon: Rocket, description: 'A serve that the opponent cannot touch!' },
  { name: 'Double Fault', icon: Flame, description: 'Two consecutive serving faults.' },
  { name: 'Break Point', icon: Zap, description: 'An opportunity to win the opponent\'s serve game.' },
  { name: 'Deuce', icon: Circle, description: 'The score is tied at 40-40.' },
  { name: 'Volley', icon: Activity, description: 'Hitting the ball before it bounces.' },
  { name: 'Lob', icon: CircleDot, description: 'A high, arcing shot over the opponent.' },
  { name: 'Smash', icon: Trophy, description: 'A powerful overhead shot.' },
  { name: 'Drop Shot', icon: Target, description: 'A soft shot that barely clears the net.' },
  { name: 'Backhand', icon: Award, description: 'A shot hit with the back of the hand facing forward.' },
  { name: 'Forehand', icon: Shield, description: 'A shot hit with the palm facing forward.' },
  { name: 'Let', icon: Radio, description: 'A serve that touches the net but lands in.' },
  { name: 'Rally', icon: Users, description: 'A long exchange of shots between players.' },
  { name: 'Free Space', icon: Star, description: 'Free space - automatically marked!' },
  { name: 'Net Play', icon: Flag, description: 'Aggressive play close to the net.' },
  { name: 'Baseline', icon: Box, description: 'Playing from the back of the court.' },
  { name: 'Tiebreak', icon: Crown, description: 'A special game to decide a tied set.' },
  { name: 'Winner', icon: Goal, description: 'A shot the opponent cannot return.' },
  { name: 'Unforced Error', icon: Diamond, description: 'A mistake made without pressure.' },
  { name: 'Challenge', icon: Crosshair, description: 'A player challenges a line call.' },
  { name: 'Service Game', icon: Shirt, description: 'A game where a player is serving.' },
  { name: 'Match Point', icon: Star, description: 'One point away from winning the match!' },
  { name: 'Love', icon: Heart, description: 'A score of zero in tennis.' },
  { name: 'Slice', icon: CircleDot, description: 'A shot with backspin.' },
  { name: 'Crosscourt', icon: Flame, description: 'A shot hit diagonally across the court.' },
  { name: 'Grand Slam', icon: Trophy, description: 'Winning all four major tournaments!' },
];

const hockeyItems: BingoItem[] = [
  { name: 'Goal', icon: Goal, description: 'The puck enters the net for a score!' },
  { name: 'Save', icon: Shield, description: 'The goalie stops a shot on goal.' },
  { name: 'Penalty', icon: Square, description: 'A player is sent to the penalty box.' },
  { name: 'Power Play', icon: Zap, description: 'One team has more players due to a penalty.' },
  { name: 'Hat Trick', icon: Crown, description: 'A player scores three goals in one game!' },
  { name: 'Assist', icon: Users, description: 'A pass that leads to a goal.' },
  { name: 'Face-Off', icon: CircleDot, description: 'The puck is dropped to start play.' },
  { name: 'Icing', icon: Flame, description: 'The puck is shot from behind center across the goal line.' },
  { name: 'Offside', icon: Flag, description: 'A player enters the offensive zone too early.' },
  { name: 'Breakaway', icon: Rocket, description: 'A player breaks free for a one-on-one with the goalie.' },
  { name: 'Slapshot', icon: Activity, description: 'A powerful shot using a full backswing.' },
  { name: 'Body Check', icon: Diamond, description: 'A player uses their body to stop an opponent.' },
  { name: 'Free Space', icon: Star, description: 'Free space - automatically marked!' },
  { name: 'Short-Handed', icon: Heart, description: 'Playing with fewer players than the opponent.' },
  { name: 'Overtime', icon: Timer, description: 'Extra time to break a tie.' },
  { name: 'Empty Net', icon: Target, description: 'The goalie is pulled for an extra attacker.' },
  { name: 'Wrist Shot', icon: Crosshair, description: 'A quick shot using wrist movement.' },
  { name: 'Deke', icon: Trophy, description: 'A fake move to get past a defender or goalie.' },
  { name: 'Rebound', icon: Circle, description: 'A shot attempt following a saved shot.' },
  { name: 'High Stick', icon: Radio, description: 'A penalty for hitting with a raised stick.' },
  { name: 'Wraparound', icon: Award, description: 'Skating behind the net and trying to score.' },
  { name: 'Glove Save', icon: Box, description: 'The goalie catches the puck with their glove.' },
  { name: 'Scramble', icon: Flame, description: 'A chaotic play with many players around the puck.' },
  { name: 'Shutout', icon: Star, description: 'The goalie doesn\'t allow any goals!' },
  { name: 'Fight', icon: Shield, description: 'Players engage in a physical altercation.' },
];

const americanFootballItems: BingoItem[] = [
  { name: 'Touchdown', icon: Rocket, description: 'A player crosses the goal line to score 6 points!' },
  { name: 'Field Goal', icon: Target, description: 'The kicker splits the uprights for 3 points.' },
  { name: 'Interception', icon: Zap, description: 'A defender catches a pass intended for the offense.' },
  { name: 'Fumble', icon: Circle, description: 'A ball carrier loses possession of the football.' },
  { name: 'Sack', icon: Shield, description: 'The quarterback is tackled behind the line of scrimmage.' },
  { name: 'Penalty Flag', icon: Flag, description: 'A penalty flag is thrown for a rule violation.' },
  { name: 'First Down', icon: Activity, description: 'The offense gains 10 yards and earns a new set of downs.' },
  { name: 'Extra Point', icon: Award, description: 'The offense kicks or runs in for 1 or 2 points after a TD.' },
  { name: 'Punt', icon: Flame, description: 'The offense punts the ball away on fourth down.' },
  { name: 'Safety', icon: Home, description: 'The defense tackles the ball carrier in their own end zone for 2 points.' },
  { name: 'Two-Point Conv.', icon: Crosshair, description: 'The offense runs or passes into the end zone for 2 points after a TD.' },
  { name: 'Onside Kick', icon: CircleDot, description: 'A short kickoff attempt to recover the ball.' },
  { name: 'Free Space', icon: Star, description: 'Free space - automatically marked!' },
  { name: 'Hail Mary', icon: Crown, description: 'A desperation long pass attempt near the end of the half or game.' },
  { name: 'Blitz', icon: Zap, description: 'Extra defenders rush the quarterback.' },
  { name: 'Red Zone', icon: Diamond, description: 'The offense has the ball inside the opponent\'s 20-yard line.' },
  { name: 'Challenge Flag', icon: Box, description: 'A coach challenges an on-field ruling.' },
  { name: 'Kickoff Return', icon: Rocket, description: 'A player returns the kickoff for big yards or a touchdown.' },
  { name: 'Fake Punt', icon: Radio, description: 'The punting team fakes the kick and runs or passes.' },
  { name: 'Screen Pass', icon: Users, description: 'A short pass to a receiver behind blockers.' },
  { name: 'Coin Toss', icon: CircleDot, description: 'The coin toss determines who receives the opening kickoff.' },
  { name: 'Overtime', icon: Timer, description: 'The game is tied after regulation and goes to overtime.' },
  { name: 'Snap', icon: Activity, description: 'The center snaps the ball to begin a play.' },
  { name: 'Chant', icon: Users, description: 'The crowd erupts in a team chant.' },
  { name: 'Injury', icon: Heart, description: 'A player goes down with an injury.' },
];

export function getBingoItems(sport: Sport): BingoItem[] {
  switch (sport) {
    case 'soccer':
      return soccerItems;
    case 'americanFootball':
      return americanFootballItems;
    case 'baseball':
      return baseballItems;
    case 'basketball':
      return basketballItems;
    case 'tennis':
      return tennisItems;
    case 'hockey':
      return hockeyItems;
    default:
      return soccerItems;
  }
}
