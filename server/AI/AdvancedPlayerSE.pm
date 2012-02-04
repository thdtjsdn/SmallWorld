package AI::AdvancedPlayerSE;


use strict;
use warnings;
use utf8;

use base('AI::AdvancedPlayer');

use List::Util qw( max min );

use SW::Util qw( swLog timeStart timeEnd );

use SmallWorld::Consts;

use AI::Config;
use AI::Consts;


sub _getGamePhase {
  my ($self, $g) = @_;
  return GP_LATE if ($g->{gs}->maxTurnNum - $g->{gs}->currentTurn < 3);
  my $dr = $g->{gs}->getPlayer->declinedRace;
  my $regs = $dr->regions;
  return GP_EARLY if (scalar(@$regs) < 2);
  return GP_MIDDLE;
}

# создает различные варианты путей захвата регионов, а также подсчитывает кол-во
# бонусных монеток и кол-во затраченных фигурок
sub _constructBadgesEstimates {
  my ($self, $g) = @_;
  my @result = ();
  my $i = 0;
  my $phase = $self->_getGamePhase($g);
  foreach ( @{ $g->{gs}->tokenBadges } ) {
    push @result, {
      est => (
        (EST_RACE->{$_->{raceName}}->[$phase] + 
        EST_POWER->{$_->{specialPowerName}}->[$phase]) * 2 +
        $_->{bonusMoney} - $i),
      idx => $i
    };
    ++$i;
  }
  swLog(LOG_FILE, '$phase', $phase);
  swLog(LOG_FILE, '@estimates', \@result);
  return (sort { $b->{est} <=> $a->{est} } @result);
}

sub _shouldConquer {
  my ($self, $g) = @_;
  return 1 if $g->{gs}->stage ne GS_BEFORE_CONQUEST || $self->_isLastTurn($g);
  my $p = $g->{gs}->getPlayer;
  my $dregs = $p->declinedRace->regions;
  my $aregs = $p->activeRace->regions;
  my $availableTokens = $p->tokens + $p->activeRace->redeployTokensBonus($p);

  #если раса в упадке слаба то decline, много фигурок на руках или достаточно регионов то не decline
  return scalar(@$dregs) < 2 && $p->declinedTokenBadgeId == -1  && $availableTokens > 4 ||
         scalar(@$dregs) > 1 && ($availableTokens > 4 || scalar(@$dregs) + scalar(@$aregs) > 9);
}

1;

__END__