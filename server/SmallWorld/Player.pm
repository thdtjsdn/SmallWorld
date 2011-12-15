package SmallWorld::Player;


use strict;
use warnings;
use utf8;

use base ('SmallWorld::SafeObj');

# определяет принадлежит ли регион активной расе
sub activeConq {
  my ($self, $region) = @_;
  return
    ($self->{currentTokenBadge}->{tokenBadgeId} // -1)  == ($region->{tokenBadgeId} // -2);
}

1;

__END__
